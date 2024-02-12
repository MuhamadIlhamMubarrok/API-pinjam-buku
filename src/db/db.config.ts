import { Injectable } from '@nestjs/common';
import { Connection, Schema, createConnection } from 'mongoose';

@Injectable()
export class MongooseConfigService {
  private readonly connections: Map<string, Connection> = new Map();

  getConnection(dbUri: string): Connection {
    if (!this.connections.has(dbUri)) {
      const connection = createConnection(dbUri);
      this.connections.set(dbUri, connection);
    }
    return this.connections.get(dbUri);
  }

  getModel(dbUri: string, name: string, schema: Schema) {
    const connection = this.getConnection(dbUri);
    return connection.model(name, schema);
  }
}
