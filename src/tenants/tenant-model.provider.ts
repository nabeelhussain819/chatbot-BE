/* eslint-disable prettier/prettier */
import { REQUEST } from '@nestjs/core';
import { FactoryProvider, Scope } from '@nestjs/common';
import { TenantConnectionService } from './tenant-connection.service';
import { Model } from 'mongoose';
import { Tenant } from 'src/schemas/tenant.schema';
import { UserSchema } from 'src/schemas/user.schema';
import { CardSchema } from 'src/schemas/card.schema';
import { ChatSchema } from 'src/schemas/chat.schema';
import { ChatbotSchema } from 'src/schemas/chatbot.schema';
import { PlanSchema } from 'src/schemas/plans.schema';
import { KnowledgeBaseSchema } from 'src/schemas/knowledge.schema';
import { BillingSchema } from 'src/schemas/billing.schema';
import { PackageSchema } from 'src/schemas/package.schema';

export const TenantModelProvider: FactoryProvider = {
  provide: 'TENANT_MODELS',
  scope: Scope.REQUEST,
  inject: [REQUEST, TenantConnectionService, 'TENANT_MODEL'],
  useFactory: async (
    req,
    tenantConnectionService: TenantConnectionService,
    tenantModel: Model<Tenant>,
  ) => {
    const tenantId = req.headers['x-tenant-id'] as string;
    if (!tenantId) {
      const isPublicRoute =
        req.path.startsWith('/auth') || req.path === '/plans';
      if (isPublicRoute) {
        return null;
      }
      throw new Error('Missing x-tenant-id header');
    }
    const tenant = await tenantModel.findOne({ tenantId }).exec();
    if (!tenant) {
      throw new Error(`Tenant ${tenantId} not found`);
    }
    const models = {};
    const connection = await tenantConnectionService.getConnection(
      tenantId,
      tenant.dbUri,
    );

    if (!connection.models.Package)
      models['PackageModel'] = connection.model('Package', PackageSchema);
    else models['PackageModel'] = connection.models.Package;

    if (!connection.models.User)
      models['UserModel'] = connection.model('User', UserSchema);
    else models['UserModel'] = connection.models.User;

    if (!connection.models.Card)
      models['CardModel'] = connection.model('Card', CardSchema);
    else models['CardModel'] = connection.models.Card;

    if (!connection.models.Chat)
      models['ChatModel'] = connection.model('Chat', ChatSchema);
    else models['ChatModel'] = connection.models.Chat;

    if (!connection.models.ChatBot)
      models['ChatbotModel'] = connection.model('Chatbot', ChatbotSchema);
    else models['ChatbotModel'] = connection.models.ChatBot;

    if (!connection.models.Plan)
      models['PlanModel'] = connection.model('Plan', PlanSchema);
    else models['PlanModel'] = connection.models.Plan;

    if (!connection.models.KnowledgeBase)
      models['KnowledgeBaseModel'] = connection.model(
        'KnowledgeBase',
        KnowledgeBaseSchema,
      );
    else models['KnowledgeBaseModel'] = connection.models.KnowledgeBase;

    if (!connection.models.Billing)
      models['BillingModel'] = connection.model('Billing', BillingSchema);
    else models['BillingModel'] = connection.models.Billing;


    return models;
  },
};
