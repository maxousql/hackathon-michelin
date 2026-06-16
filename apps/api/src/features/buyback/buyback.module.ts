import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { AuthModule } from '../auth/auth.module';
import { BuybackController } from './buyback.controller';
import { BuybackService } from './buyback.service';

@Module({
  imports: [AuthModule, PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [BuybackController],
  providers: [BuybackService],
})
export class BuybackModule {}
