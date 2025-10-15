/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { Connection, createConnection } from 'mongoose';

@Injectable()
export class TenantConnectionService {
  private connections: Map<string, Connection> = new Map();

  async getConnection(tenantId: string, dbUri: string): Promise<Connection> {
    if (this.connections.has(tenantId)) {
      return this.connections.get(tenantId)!;
    }

    const connection = await createConnection(dbUri);
    this.connections.set(tenantId, connection);
    return connection;
  }
}
