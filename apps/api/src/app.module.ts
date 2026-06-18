import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { validateEnvironment } from './config/environment';
import { AdminModule } from './features/admin/admin.module';
import { AuthModule } from './features/auth/auth.module';
import { BikesModule } from './features/bikes/bikes.module';
import { BuybackModule } from './features/buyback/buyback.module';
import { ChallengeModule } from './features/challenge/challenge.module';
import { ComparatorModule } from './features/comparator/comparator.module';
import { ProductsModule } from './features/products/products.module';
import { RetailersModule } from './features/retailers/retailers.module';
import { RaceIntelligenceModule } from './features/race-intelligence/race-intelligence.module';
import { SavedRacesModule } from './features/saved-races/saved-races.module';
import { StravaModule } from './features/strava/strava.module';
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
    BikesModule,
    BuybackModule,
    ChallengeModule,
    ComparatorModule,
    ProductsModule,
    RetailersModule,
    StatusModule,
    RaceIntelligenceModule,
    SavedRacesModule,
    StravaModule,
  ],
})
export class AppModule {}
