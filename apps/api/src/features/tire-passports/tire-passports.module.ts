import { Module } from '@nestjs/common';

import { TirePassportsController } from './tire-passports.controller';
import { TirePassportsService } from './tire-passports.service';

@Module({
  controllers: [TirePassportsController],
  providers: [TirePassportsService],
})
export class TirePassportsModule {}
