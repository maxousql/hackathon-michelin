import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { MichelinProduct } from '@michelin/contracts';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ComparatorService } from './comparator.service';

const productsService = {
  getByIds: vi.fn(),
};

function product(
  overrides: Partial<MichelinProduct> & Pick<MichelinProduct, 'id'>,
): MichelinProduct {
  return {
    global_id: null,
    brand: 'MICHELIN',
    product_type: 'TYRE',
    cycle_type: 'ROAD',
    segment: null,
    range: null,
    bead: null,
    cai: null,
    rear_fit_compatible: null,
    customer_market: null,
    width_etrto: null,
    diameter_etrto: null,
    designation: null,
    type: null,
    valve: null,
    valve_length: null,
    ean_code: null,
    mspn_code: null,
    upc_code: null,
    livm: null,
    discontinued_date: null,
    weight: null,
    conditioning: null,
    unit_packaging_weight: null,
    unit_packaging_width: null,
    unit_packaging_depth: null,
    unit_packaging_heigth: null,
    individual_packaging_material: null,
    transportation_packaging_weight: null,
    transportation_packaging_width: null,
    transportation_packaging_depth: null,
    transportation_packaging_heigth: null,
    transportation_packaging_material: null,
    rpc_code: null,
    market_perimeter: null,
    web_range_name: null,
    web_diameter: '700',
    web_diameter_1: null,
    web_width: '28',
    web_width_1: null,
    rim_type: null,
    web_product_designation: null,
    fitting: null,
    tpi: null,
    minimum_pressure: null,
    maximum_pressure: null,
    minimum_pressure_1: null,
    maximum_pressure_1: null,
    recommended_inner_tube: null,
    sidewall_type: null,
    sealing: null,
    shore: null,
    sidewall_color: null,
    tread_pattern_color: null,
    terrain_types: null,
    use: null,
    rubber_technologies: null,
    casing_technologies: null,
    tread_pattern_technologies: null,
    reinforcement_technologies: null,
    e_bike_technologies: null,
    conversion_psi_mini: null,
    conversion_psi_maxi: null,
    eco_box_pack_type: null,
    poids_total: null,
    reflective_strip: null,
    knurling_strip: null,
    shoulder_color: null,
    border_color: null,
    label_type: null,
    cycle_type_web: null,
    ...overrides,
    id: overrides.id,
  };
}

describe('ComparatorService', () => {
  let service: ComparatorService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ComparatorService(productsService as never);
  });

  it('recommends the best scoring tire for a long road route', async () => {
    productsService.getByIds.mockResolvedValue([
      product({
        id: 1,
        web_product_designation: 'Power Cup',
        segment: 'PREMIUM RACING LINE',
        weight: '230 g',
        use: 'Race competition',
      }),
      product({
        id: 2,
        web_product_designation: 'Power Endurance',
        segment: 'PERFORMANCE LINE',
        weight: '310 g',
        use: 'Endurance long distance training',
        reinforcement_technologies: 'Bead to Bead Protek anti-crevaison',
      }),
    ]);

    const result = await service.benchmark({
      route: {
        source: 'gpx',
        surface: 'road',
        distanceKm: 150,
        elevationGainM: 2200,
        gradientStats: { flat: 35, rolling: 30, hilly: 25, steep: 10 },
        pointCount: 1600,
      },
      selectedProductIds: [1, 2],
    });

    expect(result.recommendedProductId).toBe(2);
    expect(result.results[0]?.advantages[0]).toBe(
      'Meilleur score global pour cet itinéraire.',
    );
    expect(result.routeSummary).toContain('150 km');
  });

  it('throws when a selected product is missing', async () => {
    productsService.getByIds.mockResolvedValue([product({ id: 1 })]);

    await expect(
      service.benchmark({
        route: {
          source: 'manual',
          surface: 'road',
          distanceKm: 80,
          elevationGainM: 500,
        },
        selectedProductIds: [1, 9],
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('rejects products that are not tires', async () => {
    productsService.getByIds.mockResolvedValue([
      product({
        id: 1,
        product_type: 'TUBE',
        web_product_designation: 'A1 Aircomp',
      }),
      product({
        id: 2,
        web_product_designation: 'Power Endurance',
      }),
    ]);

    await expect(
      service.benchmark({
        route: {
          source: 'manual',
          surface: 'road',
          distanceKm: 80,
          elevationGainM: 500,
        },
        selectedProductIds: [1, 2],
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('explains technically different variants with equivalent performance scores', async () => {
    productsService.getByIds.mockResolvedValue([
      product({
        id: 1,
        web_product_designation: 'Power Variant 25',
        width_etrto: '25',
        diameter_etrto: '622',
        valve: 'PRESTA',
        valve_length: '48 mm',
      }),
      product({
        id: 2,
        web_product_designation: 'Power Variant 28',
        width_etrto: '28',
        diameter_etrto: '622',
        valve: 'PRESTA',
        valve_length: '80 mm',
      }),
    ]);

    const result = await service.benchmark({
      route: {
        source: 'manual',
        surface: 'road',
        distanceKm: 80,
        elevationGainM: 500,
      },
      selectedProductIds: [1, 2],
    });

    expect(result.results.every((item) => item.equivalenceNote)).toBe(true);
    expect(result.results[0]?.advantages[0]).toContain(
      'Performance équivalente',
    );
    expect(result.results[0]?.technicalDetails).toEqual(
      expect.arrayContaining(['ETRTO : 25-622', 'Valve : PRESTA 48 mm']),
    );
    expect(result.results[1]?.technicalDetails).toEqual(
      expect.arrayContaining(['ETRTO : 28-622', 'Valve : PRESTA 80 mm']),
    );
  });
});
