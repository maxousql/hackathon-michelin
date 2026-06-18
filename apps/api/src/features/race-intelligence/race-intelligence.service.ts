import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type {
  BikeCompatibility,
  Discipline,
  PressureRecommendation,
  RaceAnalyzeResponse,
  RaceBikeFitment,
  SurfaceType,
  TireRecommendation,
  WeatherCondition,
} from '@michelin/contracts';

import type { Environment } from '../../config/environment';
import type { AnalyzeRaceDto } from './dto/analyze-race.dto';
import { TIRE_CATALOG } from './tire-catalog';

interface WeatherData {
  condition: WeatherCondition;
  temperatureCelsius: number;
  description: string;
}

const BIKE_TYPE_LABELS: Record<SurfaceType, string> = {
  road: 'Route',
  gravel: 'Gravel',
  mtb: 'VTT',
};

@Injectable()
export class RaceIntelligenceService {
  constructor(private readonly config: ConfigService<Environment, true>) {}

  async analyze(dto: AnalyzeRaceDto): Promise<RaceAnalyzeResponse> {
    const weather = await this.fetchWeather(dto.locationName, dto.raceDate);
    const fitmentSurface = dto.bike?.type ?? dto.surface;
    const tire = this.applyBikeFitment(
      this.selectTire(
        fitmentSurface,
        dto.discipline,
        weather.condition,
        dto.distanceKm,
      ),
      dto.bike,
    );
    const pressure = this.computePressure(
      fitmentSurface,
      dto.riderWeightKg,
      weather.condition,
    );
    const compatibility = dto.bike
      ? this.buildBikeCompatibility(dto.bike, dto.surface)
      : undefined;
    const justification = this.buildJustification(
      dto,
      tire,
      weather,
      pressure,
      compatibility,
    );

    return {
      tire,
      pressure,
      weatherSummary: weather.description,
      justification,
      confidenceScore: this.computeConfidence(dto),
      bikeCompatibility: compatibility,
    };
  }

  private selectTire(
    surface: SurfaceType,
    discipline: Discipline,
    weather: WeatherCondition,
    distanceKm: number,
  ): TireRecommendation {
    if (surface === 'gravel') {
      return TIRE_CATALOG['power-gravel']!;
    }

    if (surface === 'mtb') {
      if (discipline === 'gravity') return TIRE_CATALOG['wild-enduro-mh']!;
      if (discipline === 'enduro') return TIRE_CATALOG['force-enduro']!;
      return TIRE_CATALOG['force-am']!;
    }

    if (discipline === 'competition' && weather !== 'rain') {
      return TIRE_CATALOG['power-cup-2']!;
    }
    if (weather === 'rain' || distanceKm < 60) {
      return TIRE_CATALOG['power-all-season']!;
    }
    if (distanceKm >= 100 || discipline === 'training') {
      return TIRE_CATALOG['power-endurance']!;
    }
    return TIRE_CATALOG['power-all-season']!;
  }

  private applyBikeFitment(
    tire: TireRecommendation,
    bike?: RaceBikeFitment,
  ): TireRecommendation {
    if (!bike) return tire;

    const details = this.buildFitmentDetails(bike);
    const fitmentHighlight =
      details.length > 0
        ? `Compatible ${details.join(' · ')}`
        : `Compatible ${BIKE_TYPE_LABELS[bike.type]}`;

    return {
      ...tire,
      description: `${tire.description} Configuration affinée pour ${bike.name}.`,
      highlights: [...new Set([fitmentHighlight, ...tire.highlights])],
    };
  }

  private buildBikeCompatibility(
    bike: RaceBikeFitment,
    routeSurface: SurfaceType,
  ): BikeCompatibility {
    const details = this.buildFitmentDetails(bike);
    const warning =
      bike.type !== routeSurface
        ? `Le vélo sélectionné est typé ${BIKE_TYPE_LABELS[bike.type]} alors que le parcours est ${BIKE_TYPE_LABELS[routeSurface].toLowerCase()}. La recommandation privilégie la compatibilité avec ce vélo.`
        : undefined;

    return {
      bikeId: bike.id,
      bikeName: bike.name,
      summary:
        details.length > 0 ? details.join(' · ') : BIKE_TYPE_LABELS[bike.type],
      details,
      warning,
    };
  }

  private buildFitmentDetails(bike: RaceBikeFitment): string[] {
    const diameter = this.clean(bike.tireDiameter);
    const width = this.clean(bike.tireWidth);
    const size =
      diameter && width ? `${diameter} x ${width}` : diameter || width;

    return [
      BIKE_TYPE_LABELS[bike.type],
      size,
      bike.tireSealing,
      bike.isEbike ? 'E-bike' : null,
    ].filter((detail): detail is string => Boolean(detail));
  }

  private computePressure(
    surface: SurfaceType,
    riderWeightKg: number,
    weather: WeatherCondition,
  ): PressureRecommendation {
    if (surface === 'mtb') {
      const base = riderWeightKg > 85 ? 2.5 : 2.2;
      const wet = weather === 'rain' ? -0.1 : 0;
      const front = Math.round((base + wet) * 10) / 10;
      const rear = Math.round((base + 0.1 + wet) * 10) / 10;
      return {
        frontBar: front,
        rearBar: rear,
        note: 'Pression recommandée pour tubeless. Ajustez ±0.2 bar selon votre ressenti terrain.',
      };
    }

    if (surface === 'gravel') {
      const base = riderWeightKg > 85 ? 3.8 : 3.4;
      const wet = weather === 'rain' ? -0.2 : 0;
      const front = Math.round((base + wet) * 10) / 10;
      const rear = Math.round((base + 0.2 + wet) * 10) / 10;
      return {
        frontBar: front,
        rearBar: rear,
        note: 'Pression gravel optimisée pour mixed terrain. Réduisez sur chemins techniques.',
      };
    }

    const base = 7.2;
    const weightBonus =
      riderWeightKg > 80 ? 0.3 : riderWeightKg > 70 ? 0.15 : 0;
    const wetPenalty = weather === 'rain' ? -0.3 : 0;
    const front = Math.round((base + weightBonus + wetPenalty) * 10) / 10;
    const rear = Math.round((base + weightBonus + 0.3 + wetPenalty) * 10) / 10;

    return {
      frontBar: front,
      rearBar: rear,
      note:
        weather === 'rain'
          ? 'Pression réduite pour meilleur contact sol par temps humide.'
          : 'Pression optimisée pour votre morphologie. Ajustez selon le revêtement.',
    };
  }

  private buildJustification(
    dto: AnalyzeRaceDto,
    tire: TireRecommendation,
    weather: WeatherData,
    pressure: PressureRecommendation,
    compatibility?: BikeCompatibility,
  ): string {
    const surfaceLabel: Record<SurfaceType, string> = {
      road: 'route',
      gravel: 'gravel',
      mtb: 'VTT',
    };
    const disciplineLabel: Record<Discipline, string> = {
      competition: 'compétition',
      sportive: 'cyclosportive',
      training: 'entraînement',
      enduro: 'enduro',
      'all-mountain': 'all mountain',
      gravity: 'gravity',
    };

    const parts: string[] = [
      `Pour votre ${disciplineLabel[dto.discipline]} ${surfaceLabel[dto.surface]} de ${dto.distanceKm} km avec ${dto.elevationGainM} m de dénivelé positif,`,
      `les conditions météo prévues à ${dto.locationName} le ${new Date(dto.raceDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} indiquent ${weather.description.toLowerCase()}.`,
    ];

    if (compatibility) {
      parts.push(
        `Le vélo sélectionné, ${compatibility.bikeName}, ajoute une contrainte de compatibilité ${compatibility.summary}.`,
      );
      if (compatibility.warning) parts.push(compatibility.warning);
    }

    if (dto.surface === 'road') {
      if (tire.id === 'power-cup-2') {
        parts.push(
          `Avec des conditions sèches et un objectif compétition, le ${tire.name} est le choix optimal : grip maximal et poids plume pour chaque watt compté.`,
        );
      } else if (tire.id === 'power-all-season') {
        parts.push(
          `Le ${tire.name} garantit la sécurité par tous les temps grâce à sa sculpture adaptée au mouillé et à sa protection anti-crevaison.`,
        );
      } else {
        parts.push(
          `Sur ${dto.distanceKm} km, la durabilité du ${tire.name} prime : protection renforcée et longévité pour aller au bout sans défaillance.`,
        );
      }
    } else if (dto.surface === 'gravel') {
      parts.push(
        `Le ${tire.name} est la référence gravel Michelin pour naviguer efficacement entre asphalte et chemins, sans jamais compromettre la motricité.`,
      );
    } else {
      parts.push(
        `En ${disciplineLabel[dto.discipline]}, le ${tire.name} offre le grip et la protection nécessaires pour les terrains techniques que vous allez affronter.`,
      );
    }

    parts.push(
      `Pression recommandée : ${pressure.frontBar} bar avant / ${pressure.rearBar} bar arrière pour votre gabarit de ${dto.riderWeightKg} kg.`,
    );

    return parts.join(' ');
  }

  private computeConfidence(dto: AnalyzeRaceDto): number {
    let score = 75;
    if (dto.hasGpx) score += 10;
    if (dto.locationName.length > 5) score += 10;
    if (dto.elevationGainM > 0) score += 5;
    if (dto.bike) score += 5;
    return Math.min(score, 100);
  }

  private async fetchWeather(
    locationName: string,
    raceDate: string,
  ): Promise<WeatherData> {
    const apiKey = this.config.get<string | undefined>('OPENWEATHER_API_KEY');

    if (!apiKey) return this.generateFallbackWeather(raceDate);

    try {
      const geocodeUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(locationName)}&limit=1&appid=${apiKey}`;
      const geoResponse = await fetch(geocodeUrl, {
        signal: AbortSignal.timeout(5000),
      });

      if (!geoResponse.ok) return this.generateFallbackWeather(raceDate);

      const geoData = (await geoResponse.json()) as Array<{
        lat: number;
        lon: number;
      }>;

      if (!geoData.length) return this.generateFallbackWeather(raceDate);

      const { lat, lon } = geoData[0]!;
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=fr`;
      const forecastResponse = await fetch(forecastUrl, {
        signal: AbortSignal.timeout(5000),
      });

      if (!forecastResponse.ok) return this.generateFallbackWeather(raceDate);

      const forecastData = (await forecastResponse.json()) as {
        list: Array<{
          dt: number;
          weather: Array<{ description: string; main: string }>;
          main: { temp: number };
        }>;
      };

      const raceDateMs = new Date(raceDate).getTime();
      const closest = forecastData.list.reduce((prev, curr) => {
        return Math.abs(curr.dt * 1000 - raceDateMs) <
          Math.abs(prev.dt * 1000 - raceDateMs)
          ? curr
          : prev;
      });

      const main = closest.weather[0]?.main ?? 'Clear';
      const description = closest.weather[0]?.description ?? 'Ciel dégagé';
      const temp = Math.round(closest.main.temp);

      const condition: WeatherCondition =
        main === 'Rain' || main === 'Drizzle' || main === 'Thunderstorm'
          ? 'rain'
          : main === 'Clouds'
            ? 'cloudy'
            : 'sun';

      return {
        condition,
        temperatureCelsius: temp,
        description: `${description.charAt(0).toUpperCase() + description.slice(1)}, ${temp}°C`,
      };
    } catch {
      return this.generateFallbackWeather(raceDate);
    }
  }

  private generateFallbackWeather(raceDate: string): WeatherData {
    const month = new Date(raceDate).getMonth();
    if (month >= 10 || month <= 2) {
      return {
        condition: 'rain',
        temperatureCelsius: 8,
        description: 'Temps frais, possibilité de pluie, 8°C',
      };
    }
    if (month >= 3 && month <= 5) {
      return {
        condition: 'cloudy',
        temperatureCelsius: 16,
        description: 'Ciel variable, 16°C',
      };
    }
    return {
      condition: 'sun',
      temperatureCelsius: 24,
      description: 'Ensoleillé, 24°C',
    };
  }

  private clean(value: string | null | undefined): string | null {
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
  }
}
