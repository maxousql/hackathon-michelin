import { NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ProductsController } from './products.controller';

const service = {
  list: vi.fn(),
  facets: vi.fn(),
  getById: vi.fn(),
};

describe('ProductsController', () => {
  let controller: ProductsController;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new ProductsController(service as never);
  });

  describe('list()', () => {
    it('normalizes query params into typed filters', async () => {
      service.list.mockResolvedValue({ items: [], total: 0 });

      await controller.list({
        cycleType: 'MTB',
        ebike: '1',
        page: '2',
        sort: 'diameter',
      });

      expect(service.list).toHaveBeenCalledWith(
        expect.objectContaining({
          cycleType: 'MTB',
          ebike: true,
          page: 2,
          sort: 'diameter',
        }),
      );
    });

    it('falls back to defaults for missing params', async () => {
      service.list.mockResolvedValue({ items: [], total: 0 });

      await controller.list({});

      expect(service.list).toHaveBeenCalledWith(
        expect.objectContaining({ ebike: undefined, page: 1, sort: 'range' }),
      );
    });

    it('treats a non-numeric page as 1', async () => {
      service.list.mockResolvedValue({ items: [], total: 0 });

      await controller.list({ page: 'abc' });

      expect(service.list).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1 }),
      );
    });
  });

  describe('facets()', () => {
    it('delegates to the service', async () => {
      const facets = { cycleType: ['ROAD'] };
      service.facets.mockResolvedValue(facets);

      await expect(controller.facets()).resolves.toBe(facets);
    });
  });

  describe('getById()', () => {
    it('returns the product when found', async () => {
      const product = { id: 5 };
      service.getById.mockResolvedValue(product);

      await expect(controller.getById(5)).resolves.toBe(product);
    });

    it('throws NotFoundException when the product is missing', async () => {
      service.getById.mockResolvedValue(null);

      await expect(controller.getById(999)).rejects.toThrow(NotFoundException);
    });
  });
});
