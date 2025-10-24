/* eslint-disable prettier/prettier */
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Plan } from 'src/schemas/plans.schema';

@Injectable()
export class PlanService {
  private readonly logger = new Logger(PlanService.name);

  constructor(
    @InjectModel(Plan.name) private readonly planModel: Model<Plan>,
  ) {}

  async getPlans() {
    const existingPlans = await this.planModel.find().exec();

    // if plans already exist, return them
    if (existingPlans.length > 0) {
      return existingPlans;
    }

    // default plans
    const planData = [
      {
        name: 'Starter',
        price: '$0',
        description: 'Perfect for trying out AfterShock AI Chatbot',
        features: [
          'Up to 100 messages/month',
          'Basic AI responses',
          'Email support',
          '1 chatbot',
          'Community access',
        ],
        cta: 'Get Started',
        popular: false,
      },
      {
        name: 'Pro',
        price: '$29',
        description: 'For growing businesses',
        features: [
          'Up to 10,000 messages/month',
          'Advanced AI responses',
          'Priority support',
          '5 chatbots',
          'Custom branding',
          'Analytics dashboard',
        ],
        cta: 'Start Free Trial',
        popular: true,
      },
      {
        name: 'Enterprise',
        price: 'Custom',
        description: 'For large organizations',
        features: [
          'Unlimited messages',
          'Custom AI training',
          '24/7 dedicated support',
          'Unlimited chatbots',
          'Advanced integrations',
          'SLA guarantee',
          'Custom deployment',
        ],
        cta: 'Contact Sales',
        popular: false,
      },
    ];

    // prevent duplicates: use insertMany with `ordered: false` and unique index
    const inserted = await this.planModel
      .insertMany(planData, { ordered: false })
      .catch(() => null);

    this.logger.log('✅ Default plans created');
    return inserted || planData;
  }
  async getPlanById(planId?: string | ObjectId) {
    return this.planModel.findOne({_id: planId}).exec();
  }
   async getPlanByName(name: string) {
    return this.planModel.findOne({name}).exec();
  }
}
