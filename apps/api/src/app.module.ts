import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { validateEnvironment } from './config/environment';
import { AuthModule } from './features/auth/auth.module';
import { StatusModule } from './features/status/status.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      validate: validateEnvironment,
    }),
    AuthModule,
    StatusModule,
  ],
})
export class AppModule {}
