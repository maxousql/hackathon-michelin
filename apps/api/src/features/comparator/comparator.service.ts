import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import type {
  ComparatorRouteStats,
  MichelinProduct,
  SurfaceType,
  TireBenchmarkResult,
  TireComparisonProduct,
  TireComparisonResponse,
  TireComparisonScore,
} from '@michelin/contracts';

import { ProductsService } from '../products/products.service';
import type { CompareTiresDto } from './dto/compare-tires.dto';

interface ScoreWeights {
  rollingEfficiency: number;
  grip: number;
  punctureProtection: number;
  durability: number;
  routeFit: number;
}

const SURFACE_LABELS: Record<SurfaceType, string> = {
  road: 'route',
  gravel: 'gravel',
  mtb: 'VTT',
};

const SCORE_KEYS: Array<keyof TireComparisonScore> = [
  'overall',
  'routeFit',
  'rollingEfficiency',
  'grip',
  'punctureProtection',
  'durability',
];

const EQUIVALENT_OVERALL_DELTA = 2;
const EQUIVALENT_AXIS_DELTA = 3;

@Injectable()
export class ComparatorService {
  constructor(private readonly productsService: ProductsService) {}

  async benchmark(dto: CompareTiresDto): Promise<TireComparisonResponse> {
    const products = await this.productsService.getByIds(
      dto.selectedProductIds,
    );

    if (products.length !== dto.selectedProductIds.length) {
      const foundIds = new Set(products.map((product) => product.id));
      const missing = dto.selectedProductIds.filter((id) => !foundIds.has(id));
      throw new NotFoundException(
        `Produit(s) introuvable(s) : ${missing.join(', ')}`,
      );
    }

    this.assertOnlyTyres(products);

    const results = products
      .map((product) => this.benchmarkProduct(product, dto.route))
      .sort((a, b) => b.scores.overall - a.scores.overall);

    this.annotateEquivalentPerformance(results);

    const best = results[0]!;
    best.advantages = best.equivalenceNote
      ? [
          'Performance équivalente au meilleur score : à départager par compatibilité technique.',
          ...best.advantages,
        ].slice(0, 4)
      : [
          'Meilleur score global pour cet itinéraire.',
          ...best.advantages,
        ].slice(0, 4);

    return {
      recommendedProductId: best.product.id,
      routeSummary: this.buildRouteSummary(dto.route, dto.riderWeightKg),
      results,
    };
  }

  private benchmarkProduct(
    product: MichelinProduct,
    route: ComparatorRouteStats,
  ): TireBenchmarkResult {
    const text = this.searchText(product);
    const scores: TireComparisonScore = {
      routeFit: this.scoreRouteFit(product, route, text),
      rollingEfficiency: this.scoreRolling(product, route, text),
      grip: this.scoreGrip(route, text),
      punctureProtection: this.scoreProtection(route, text),
      durability: this.scoreDurability(route, text, product),
      overall: 0,
    };
    const weights = this.weightsFor(route);
    const totalWeight =
      weights.rollingEfficiency +
      weights.grip +
      weights.punctureProtection +
      weights.durability +
      weights.routeFit;
    scores.overall = this.roundScore(
      (scores.rollingEfficiency * weights.rollingEfficiency +
        scores.grip * weights.grip +
        scores.punctureProtection * weights.punctureProtection +
        scores.durability * weights.durability +
        scores.routeFit * weights.routeFit) /
        totalWeight,
    );

    return {
      product: this.toComparisonProduct(product),
      scores,
      advantages: this.buildAdvantages(scores, route, text),
      tradeoffs: this.buildTradeoffs(scores, route, text, product),
      technicalDetails: this.buildTechnicalDetails(product),
      equivalenceNote: null,
      verdict: this.buildVerdict(product, scores, route),
    };
  }

  private assertOnlyTyres(products: MichelinProduct[]): void {
    const invalid = products.filter((product) => !this.isTyre(product));
    if (invalid.length === 0) return;

    throw new BadRequestException(
      `Le comparateur pneus accepte uniquement des pneus. Produit(s) non compatible(s) : ${invalid
        .map((product) => this.productName(product))
        .join(', ')}.`,
    );
  }

  private isTyre(product: MichelinProduct): boolean {
    const type = this.clean(product.product_type)?.toUpperCase();
    return type === 'TYRE' || type === 'TIRE';
  }

  private annotateEquivalentPerformance(results: TireBenchmarkResult[]): void {
    const equivalentProductIds = new Set<number>();

    for (let index = 0; index < results.length; index += 1) {
      for (
        let nextIndex = index + 1;
        nextIndex < results.length;
        nextIndex += 1
      ) {
        const current = results[index]!;
        const next = results[nextIndex]!;
        if (this.hasEquivalentScores(current.scores, next.scores)) {
          equivalentProductIds.add(current.product.id);
          equivalentProductIds.add(next.product.id);
        }
      }
    }

    for (const result of results) {
      if (!equivalentProductIds.has(result.product.id)) continue;
      result.equivalenceNote =
        'Performance équivalente sur cet itinéraire : le choix dépend surtout de la compatibilité technique et du montage.';
    }
  }

  private hasEquivalentScores(
    current: TireComparisonScore,
    next: TireComparisonScore,
  ): boolean {
    return SCORE_KEYS.every((key) => {
      const maxDelta =
        key === 'overall' ? EQUIVALENT_OVERALL_DELTA : EQUIVALENT_AXIS_DELTA;
      return Math.abs(current[key] - next[key]) <= maxDelta;
    });
  }

  private weightsFor(route: ComparatorRouteStats): ScoreWeights {
    const longRoute = route.distanceKm >= 100;
    const steepShare = route.gradientStats?.steep ?? 0;

    if (route.surface === 'mtb') {
      return {
        rollingEfficiency: 0.1,
        grip: steepShare >= 12 ? 0.38 : 0.35,
        punctureProtection: 0.25,
        durability: longRoute ? 0.17 : 0.15,
        routeFit: 0.15,
      };
    }

    if (route.surface === 'gravel') {
      return {
        rollingEfficiency: 0.18,
        grip: 0.25,
        punctureProtection: longRoute ? 0.28 : 0.25,
        durability: longRoute ? 0.17 : 0.15,
        routeFit: 0.15,
      };
    }

    return {
      rollingEfficiency: 0.3,
      grip: steepShare >= 10 ? 0.23 : 0.2,
      punctureProtection: longRoute ? 0.18 : 0.15,
      durability: longRoute ? 0.22 : 0.2,
      routeFit: 0.15,
    };
  }

  private scoreRouteFit(
    product: MichelinProduct,
    route: ComparatorRouteStats,
    text: string,
  ): number {
    const cycleType = this.clean(product.cycle_type)?.toLowerCase() ?? '';
    let score = 45;

    if (route.surface === 'road') {
      if (cycleType.includes('road') || text.includes('road')) score = 88;
      else if (text.includes('gravel')) score = 58;
      else if (cycleType.includes('mtb')) score = 30;
    }

    if (route.surface === 'gravel') {
      if (text.includes('gravel')) score = 92;
      else if (text.includes('mixed') || text.includes('trail')) score = 76;
      else if (cycleType.includes('road')) score = 60;
      else if (cycleType.includes('mtb')) score = 55;
    }

    if (route.surface === 'mtb') {
      if (cycleType.includes('mtb') || text.includes('enduro')) score = 92;
      else if (text.includes('trail')) score = 82;
      else if (text.includes('gravel')) score = 42;
      else if (cycleType.includes('road')) score = 24;
    }

    if (route.distanceKm >= 120 && this.hasAny(text, ['endurance', 'long'])) {
      score += 6;
    }
    if ((route.gradientStats?.steep ?? 0) >= 12 && this.hasGripWords(text)) {
      score += 5;
    }

    return this.roundScore(score);
  }

  private scoreRolling(
    product: MichelinProduct,
    route: ComparatorRouteStats,
    text: string,
  ): number {
    const weight = this.parseWeightGrams(product.weight);
    let score =
      route.surface === 'mtb' ? 58 : route.surface === 'gravel' ? 65 : 72;

    if (weight !== null) {
      if (route.surface === 'mtb') {
        score = weight <= 850 ? 82 : weight <= 1050 ? 70 : 58;
      } else if (route.surface === 'gravel') {
        score = weight <= 420 ? 86 : weight <= 560 ? 74 : 62;
      } else {
        score =
          weight <= 260 ? 92 : weight <= 330 ? 82 : weight <= 450 ? 68 : 56;
      }
    }

    if (this.hasAny(text, ['race', 'racing', 'speed', 'competition', 'cup'])) {
      score += 8;
    }
    if (this.hasAny(text, ['enduro', 'wild', 'dh shield'])) score -= 7;
    if (route.distanceKm >= 140 && this.hasAny(text, ['endurance'])) score += 4;

    return this.roundScore(score);
  }

  private scoreGrip(route: ComparatorRouteStats, text: string): number {
    let score = route.surface === 'road' ? 62 : 70;
    const steep = route.gradientStats?.steep ?? 0;
    const hilly = route.gradientStats?.hilly ?? 0;

    if (this.hasGripWords(text)) score += 16;
    if (route.surface === 'gravel' && this.hasAny(text, ['gravel', 'mixed'])) {
      score += 10;
    }
    if (
      route.surface === 'mtb' &&
      this.hasAny(text, ['enduro', 'wild', 'trail'])
    ) {
      score += 12;
    }
    if (steep >= 12) score += 8;
    else if (hilly >= 25) score += 5;
    if (route.surface === 'road' && this.hasAny(text, ['all season', 'wet'])) {
      score += 8;
    }

    return this.roundScore(score);
  }

  private scoreProtection(route: ComparatorRouteStats, text: string): number {
    let score = route.surface === 'road' ? 55 : 62;

    if (
      this.hasAny(text, [
        'protek',
        'protection',
        'reinforcement',
        'renfort',
        'shield',
        'bead to bead',
        'puncture',
        'anti-crevaison',
      ])
    ) {
      score += 22;
    }
    if (this.hasAny(text, ['tubeless', 'tlr'])) score += 8;
    if (this.hasAny(text, ['sidewall', 'flanc'])) score += 6;
    if (route.distanceKm >= 100) score += 5;
    if ((route.gradientStats?.steep ?? 0) >= 12) score += 4;

    return this.roundScore(score);
  }

  private scoreDurability(
    route: ComparatorRouteStats,
    text: string,
    product: MichelinProduct,
  ): number {
    let score = 58;
    const weight = this.parseWeightGrams(product.weight);

    if (this.hasAny(text, ['endurance', 'durable', 'long', 'training'])) {
      score += 22;
    }
    if (this.hasAny(text, ['protek', 'reinforcement', 'shield'])) score += 10;
    if (this.hasAny(text, ['race', 'racing', 'competition', 'cup'])) score -= 5;
    if (weight !== null && weight > 450 && route.surface !== 'road') score += 5;
    if (route.distanceKm >= 140 && this.hasAny(text, ['endurance', 'protek'])) {
      score += 7;
    }

    return this.roundScore(score);
  }

  private buildAdvantages(
    scores: TireComparisonScore,
    route: ComparatorRouteStats,
    text: string,
  ): string[] {
    const advantages: string[] = [];

    if (scores.routeFit >= 82) {
      advantages.push(
        `Très bonne compatibilité ${SURFACE_LABELS[route.surface]}.`,
      );
    }
    if (scores.rollingEfficiency >= 82) {
      advantages.push('Rendement élevé pour préserver la vitesse moyenne.');
    }
    if (scores.grip >= 82) {
      advantages.push('Grip solide sur les portions exigeantes du tracé.');
    }
    if (scores.punctureProtection >= 82) {
      advantages.push(
        'Protection rassurante sur longue distance ou terrain cassant.',
      );
    }
    if (scores.durability >= 82) {
      advantages.push('Durabilité adaptée aux sorties longues.');
    }
    if (this.hasAny(text, ['tubeless', 'tlr'])) {
      advantages.push(
        'Montage tubeless favorable au confort et à la motricité.',
      );
    }

    return advantages.slice(0, 3).length > 0
      ? advantages.slice(0, 3)
      : ['Profil équilibré pour les informations disponibles.'];
  }

  private buildTradeoffs(
    scores: TireComparisonScore,
    route: ComparatorRouteStats,
    text: string,
    product: MichelinProduct,
  ): string[] {
    const tradeoffs: string[] = [];

    if (scores.routeFit < 65) {
      tradeoffs.push(
        `Compatibilité limitée avec un parcours ${SURFACE_LABELS[route.surface]}.`,
      );
    }
    if (scores.rollingEfficiency < 68) {
      tradeoffs.push(
        'Rendement moins prioritaire que le grip ou la protection.',
      );
    }
    if (
      scores.grip < 68 &&
      ((route.gradientStats?.steep ?? 0) > 8 || route.surface !== 'road')
    ) {
      tradeoffs.push(
        'Grip à surveiller sur les sections raides ou techniques.',
      );
    }
    if (scores.punctureProtection < 68 && route.distanceKm >= 80) {
      tradeoffs.push('Protection moins convaincante pour un long itinéraire.');
    }
    if (!this.clean(product.weight)) {
      tradeoffs.push(
        'Poids non renseigné dans le catalogue, score rendement moins précis.',
      );
    }
    if (
      this.hasAny(text, ['race', 'racing', 'competition']) &&
      route.distanceKm >= 120
    ) {
      tradeoffs.push(
        'Orientation performance pure moins confortable sur très longue distance.',
      );
    }

    return tradeoffs.slice(0, 3).length > 0
      ? tradeoffs.slice(0, 3)
      : ['Aucun compromis majeur détecté avec les données disponibles.'];
  }

  private buildVerdict(
    product: MichelinProduct,
    scores: TireComparisonScore,
    route: ComparatorRouteStats,
  ): string {
    const name = this.productName(product);
    const strongest = this.strongestAxis(scores);
    return `${name} obtient ${scores.overall}/100 sur cet itinéraire ${SURFACE_LABELS[route.surface]} de ${this.formatNumber(route.distanceKm)} km. Son point fort principal est ${strongest}.`;
  }

  private strongestAxis(scores: TireComparisonScore): string {
    const axes = [
      ['le rendement', scores.rollingEfficiency],
      ['le grip', scores.grip],
      ['la protection', scores.punctureProtection],
      ['la durabilité', scores.durability],
      ["l'adéquation au parcours", scores.routeFit],
    ] as const;
    return axes.reduce((best, current) =>
      current[1] > best[1] ? current : best,
    )[0];
  }

  private buildRouteSummary(
    route: ComparatorRouteStats,
    riderWeightKg?: number,
  ): string[] {
    const summary = [
      `${this.sourceLabel(route.source)} · ${SURFACE_LABELS[route.surface]}`,
      `${this.formatNumber(route.distanceKm)} km`,
      `${Math.round(route.elevationGainM)} m D+`,
    ];

    const gradients = route.gradientStats;
    if (gradients) {
      summary.push(`${gradients.hilly + gradients.steep}% vallonné ou raide`);
    }
    if (riderWeightKg) summary.push(`${riderWeightKg} kg rider`);
    if (route.pointCount) summary.push(`${route.pointCount} points GPS`);

    return summary;
  }

  private toComparisonProduct(product: MichelinProduct): TireComparisonProduct {
    return {
      id: product.id,
      name: this.productName(product),
      productType: this.clean(product.product_type),
      range: this.clean(product.web_range_name) ?? this.clean(product.range),
      cycleType: this.clean(product.cycle_type),
      segment: this.clean(product.segment),
      size: this.productSize(product),
      widthEtrto: this.clean(product.width_etrto),
      diameterEtrto: this.clean(product.diameter_etrto),
      type: this.clean(product.type),
      valve: this.clean(product.valve),
      valveLength: this.clean(product.valve_length),
      rimType: this.clean(product.rim_type),
      fitting: this.clean(product.fitting),
      sealing: this.clean(product.sealing),
      weight: this.clean(product.weight),
      pressureRange: this.pressureRange(product),
      terrainTypes: this.clean(product.terrain_types),
      use: this.clean(product.use),
      technologies: this.productTechnologies(product),
    };
  }

  private buildTechnicalDetails(product: MichelinProduct): string[] {
    const details = [
      this.productSize(product)
        ? `Dimension catalogue : ${this.productSize(product)}`
        : null,
      this.etrtoSize(product),
      this.mountingDetails(product),
      this.valveDetails(product),
      this.clean(product.weight)
        ? `Poids : ${this.clean(product.weight)}`
        : null,
      this.pressureRange(product),
      this.clean(product.terrain_types)
        ? `Terrain : ${this.clean(product.terrain_types)}`
        : null,
    ].filter((detail): detail is string => detail !== null);

    return details.length > 0
      ? details.slice(0, 5)
      : ['Aucun détail technique différenciant renseigné.'];
  }

  private etrtoSize(product: MichelinProduct): string | null {
    const width = this.clean(product.width_etrto);
    const diameter = this.clean(product.diameter_etrto);
    if (width && diameter) return `ETRTO : ${width}-${diameter}`;
    if (diameter) return `ETRTO diamètre : ${diameter}`;
    if (width) return `ETRTO largeur : ${width}`;
    return null;
  }

  private mountingDetails(product: MichelinProduct): string | null {
    const values = [
      this.clean(product.sealing),
      this.clean(product.type),
      this.clean(product.rim_type),
      this.clean(product.fitting),
    ].filter((value): value is string => value !== null);
    return values.length > 0 ? `Montage : ${values.join(' · ')}` : null;
  }

  private valveDetails(product: MichelinProduct): string | null {
    const valve = this.clean(product.valve);
    const valveLength = this.clean(product.valve_length);
    if (valve && valveLength) return `Valve : ${valve} ${valveLength}`;
    if (valve) return `Valve : ${valve}`;
    if (valveLength) return `Longueur valve : ${valveLength}`;
    return null;
  }

  private pressureRange(product: MichelinProduct): string | null {
    const min = this.clean(product.minimum_pressure);
    const max = this.clean(product.maximum_pressure);
    if (min && max) return `Pression : ${min} - ${max}`;
    if (min) return `Pression mini : ${min}`;
    if (max) return `Pression maxi : ${max}`;
    return null;
  }

  private productTechnologies(product: MichelinProduct): string[] {
    return [
      product.rubber_technologies,
      product.casing_technologies,
      product.tread_pattern_technologies,
      product.reinforcement_technologies,
      product.e_bike_technologies,
    ]
      .flatMap((value) => this.splitValues(value))
      .slice(0, 5);
  }

  private productName(product: MichelinProduct): string {
    return (
      this.clean(product.web_product_designation) ??
      this.clean(product.designation) ??
      this.clean(product.web_range_name) ??
      this.clean(product.range) ??
      `Produit ${product.id}`
    );
  }

  private productSize(product: MichelinProduct): string | null {
    const diameter = this.clean(product.web_diameter);
    const width = this.clean(product.web_width);
    if (diameter && width) return `${diameter} x ${width}`;
    if (diameter) return diameter;
    if (width) return width;

    const widthEtrto = this.clean(product.width_etrto);
    const diameterEtrto = this.clean(product.diameter_etrto);
    if (widthEtrto && diameterEtrto) return `${widthEtrto}-${diameterEtrto}`;
    return null;
  }

  private searchText(product: MichelinProduct): string {
    return [
      product.web_product_designation,
      product.designation,
      product.web_range_name,
      product.range,
      product.product_type,
      product.cycle_type,
      product.segment,
      product.type,
      product.valve,
      product.valve_length,
      product.sealing,
      product.terrain_types,
      product.use,
      product.rubber_technologies,
      product.casing_technologies,
      product.tread_pattern_technologies,
      product.reinforcement_technologies,
      product.sidewall_type,
    ]
      .map((value) => this.clean(value)?.toLowerCase() ?? '')
      .join(' ');
  }

  private hasGripWords(text: string): boolean {
    return this.hasAny(text, [
      'grip',
      'adhérence',
      'adhesion',
      'wild',
      'enduro',
      'all season',
      'wet',
      'mud',
    ]);
  }

  private hasAny(text: string, words: string[]): boolean {
    return words.some((word) => text.includes(word));
  }

  private parseWeightGrams(weight: string | null): number | null {
    const value = this.clean(weight)?.toLowerCase();
    if (!value) return null;
    const match = value.match(/\d+(?:[,.]\d+)?/);
    if (!match) return null;
    const parsed = Number(match[0].replace(',', '.'));
    if (!Number.isFinite(parsed)) return null;
    return value.includes('kg') ? parsed * 1000 : parsed;
  }

  private splitValues(value: string | null): string[] {
    const clean = this.clean(value);
    if (!clean) return [];
    return clean
      .split(/[,;/|]+/)
      .map((part) => part.trim())
      .filter(Boolean);
  }

  private clean(value: string | null | undefined): string | null {
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
  }

  private roundScore(value: number): number {
    return Math.max(0, Math.min(100, Math.round(value)));
  }

  private formatNumber(value: number): string {
    return new Intl.NumberFormat('fr-FR', {
      maximumFractionDigits: 1,
    }).format(value);
  }

  private sourceLabel(source: ComparatorRouteStats['source']): string {
    if (source === 'strava') return 'Strava';
    if (source === 'gpx') return 'GPX';
    return 'Manuel';
  }
}
