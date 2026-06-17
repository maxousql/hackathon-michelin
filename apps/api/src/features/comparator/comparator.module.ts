import { Module } from '@nestjs/common';

import { ProductsModule } from '../products/products.module';
import { ComparatorController } from './comparator.controller';
import { ComparatorService } from './comparator.service';

@Module({
  imports: [ProductsModule],
  controllers: [ComparatorController],
  providers: [ComparatorService],
})
export class ComparatorModule {}
