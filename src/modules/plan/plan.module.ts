import { Module } from '@nestjs/common';
import { PlanService } from './plan.service';
import { PlanController } from './plan.controller';
import { PlanSchema } from 'src/schemas/plans.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Plan', schema: PlanSchema }])],
  providers: [PlanService],
  controllers: [PlanController],
  exports: [PlanService, MongooseModule],
})
export class PlanModule {}
