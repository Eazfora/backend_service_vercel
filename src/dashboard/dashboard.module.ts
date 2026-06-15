import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { HttpModule } from '@nestjs/axios';
import { MlIntegrationService } from './ml-integration.service';

@Module({
  imports: [PrismaModule, HttpModule],
  controllers: [DashboardController],
  providers: [DashboardService, MlIntegrationService],
})
export class DashboardModule {}
