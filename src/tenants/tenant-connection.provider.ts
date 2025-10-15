/* eslint-disable prettier/prettier */
import { REQUEST } from '@nestjs/core';
import { Connection } from 'mongoose';
import { createConnection } from 'mongoose';
import { FactoryProvider, Scope } from '@nestjs/common';
import { Request } from 'express';

export const TenantConnectionProvider: FactoryProvider<Promise<Connection>> = {
  provide: 'TENANT_CONNECTION',
  scope: Scope.REQUEST, // ✅ tenant-specific per request
  inject: [REQUEST],
  useFactory: async (req: Request) => {
    const tenantId = req.headers['x-tenant-id'] as string;
    if (!tenantId) throw new Error('Missing x-tenant-id header');

    const mongoURI = `mongodb://localhost:27017/${tenantId}`;
    const connection = await createConnection(mongoURI);
    return connection;
  },
};
