import { Injectable } from '@nestjs/common';
import { Connection, Schema, createConnection } from 'mongoose';

@Injectable()
export class MongooseConfigService {
  private readonly connections: Map<string, Connection> = new Map();

  async getConnection(dbUri: string): Promise<Connection> {
    if (!this.connections.has(dbUri)) {
      const connection = createConnection(dbUri);
      this.connections.set(dbUri, connection);
    }
    return this.connections.get(dbUri);
  }

  async getModel(dbUri: string, name: string, schema: Schema) {
    const connection = await this.getConnection(dbUri);
    return connection.model(name, schema);
  }

  closeConnection() {
    this.connections.clear();
  }
}
