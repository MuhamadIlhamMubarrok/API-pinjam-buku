import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { Model, PipelineStage } from 'mongoose';
import { IGroup, IRole } from 'schemas';
import { MongooseConfigService } from '../db/db.config';
import { CreateGroupDTO } from 'src/dto/role.dto';
import { RoleSchema } from '../models/role.model';

@Injectable({ scope: Scope.REQUEST })
export class RoleService {
  private roleModel: Model<IRole>;
  constructor(
    @Inject(MongooseConfigService)
    private connectionManager: MongooseConfigService,
    @Inject(REQUEST)
    private req: Request,
  ) {
    const connection = this.connectionManager.getConnection(
      `mongodb://127.0.0.1:27017/${this.req?.user?.companyCode || 'error'}_tagsamurai`,
    );
    this.roleModel = connection.model('role', RoleSchema, 'roles');
  }

  async aggregateGroups(pipeline: PipelineStage[]) {
    return await this.roleModel.aggregate(pipeline);
  }

  async generateKey(): Promise<number> {
    const group = await this.roleModel
      .findOne({ key: { $exists: true } })
      .sort({ key: -1 });

    if (group?.key) {
      return group.key + 1;
    }

    return 1;
  }
  async createGroup(data: CreateGroupDTO): Promise<IGroup> {
    const key = await this.generateKey();
    return await this.roleModel.create({ ...data, key });
  }
}
