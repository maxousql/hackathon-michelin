import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type {
  MichelinProduct,
  ProductFacets,
  ProductFilters,
  ProductListResponse,
} from '@michelin/contracts';

import { ProductQueryDto } from './dto/product-query.dto';
import { ProductsService } from './products.service';

/** Normalise les paramètres de requête validés en filtres typés. */
function toFilters(query: ProductQueryDto): ProductFilters {
  const page = Number(query.page);
  return {
    q: query.q,
    cycleType: query.cycleType,
    segment: query.segment,
    productType: query.productType,
    sealing: query.sealing,
    diameter: query.diameter,
    width: query.width,
    ebike: query.ebike === '1' ? true : undefined,
    sort: query.sort === 'diameter' ? 'diameter' : 'range',
    page: Number.isInteger(page) && page > 0 ? page : 1,
  };
}

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'List the catalogue, filtered and paginated' })
  @ApiOkResponse({ description: 'Paginated list of products.' })
  list(@Query() query: ProductQueryDto): Promise<ProductListResponse> {
    return this.productsService.list(toFilters(query));
  }

  // Déclaré avant `:id` pour ne pas être capturé par le paramètre.
  @Get('facets')
  @ApiOperation({ summary: 'Distinct values available for each filter' })
  @ApiOkResponse({ description: 'Filter facets.' })
  facets(): Promise<ProductFacets> {
    return this.productsService.facets();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single product by id' })
  @ApiOkResponse({ description: 'The product detail.' })
  async getById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<MichelinProduct> {
    const product = await this.productsService.getById(id);
    if (!product) {
      throw new NotFoundException(`Product ${id} not found.`);
    }
    return product;
  }
}
