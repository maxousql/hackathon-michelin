import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { validateEnvironment } from './config/environment';
import { AdminModule } from './features/admin/admin.module';
import { AuthModule } from './features/auth/auth.module';
import { BuybackModule } from './features/buyback/buyback.module';
import { ProductsModule } from './features/products/products.module';
import { RetailersModule } from './features/retailers/retailers.module';
import { RaceIntelligenceModule } from './features/race-intelligence/race-intelligence.module';
import { StatusModule } from './features/status/status.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      validate: validateEnvironment,
    }),
    AdminModule,
    AuthModule,
    BuybackModule,
    ProductsModule,
    RetailersModule,
    StatusModule,
    RaceIntelligenceModule,
  ],
})
export class AppModule {}
