import { Module } from '@nestjs/common';

import { BikesController } from './bikes.controller';
import { BikesService } from './bikes.service';

@Module({
  controllers: [BikesController],
  providers: [BikesService],
})
export class BikesModule {}
