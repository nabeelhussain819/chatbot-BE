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
        price: '$100',
        total_chatbot: 1,
        default: true,
        total_request: 1000,
        duration: '30 days',
        description: 'For small businesses',
        features: [
          'Up to 1,000 messages/month',
          'Basic AI responses',
          '24/7 support',
          '1 chatbot',
          'Custom branding',
          'Analytics dashboard',
        ]
      },
      {
        name: 'Pro',
        description: 'For growing businesses',
        duration: '60 days',
        features: [
          'Up to 10,000 messages/month',
          'Advanced AI responses',
          'Priority support',
          '5 chatbots',
          'Custom branding',
          'Analytics dashboard',
        ],
        price: '$500',
        total_chatbot: 5,
        default: false,
        total_request: 5000,
      },
      {
        name: 'Enterprise',
        price: 'Custom',
        duration: 'Unlimited',
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
        default: false,
        total_chatbot: 10,
        total_request: 10000,
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
  async getDefaultPlan () {
    const id = await this.planModel.findOne({default: true}).exec();
    return id
  }
  async getExistingPlans({id}) {
    return this.planModel.find({_id:id}).exec();
  }
}
