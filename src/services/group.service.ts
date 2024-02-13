import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { Model, PipelineStage } from 'mongoose';
import { IGroup } from 'schemas';
import { MongooseConfigService } from '../db/db.config';
import { GroupSchema } from '../models/group.model';
import { CreateGroupDTO } from 'src/dto/group.dto';

@Injectable({ scope: Scope.REQUEST })
export class GroupService {
  private groupModel: Model<IGroup>;
  constructor(
    @Inject(MongooseConfigService)
    private connectionManager: MongooseConfigService,
    @Inject(REQUEST)
    private req: Request,
  ) {
    const connection = this.connectionManager.getConnection(
      `mongodb://127.0.0.1:27017/${this.req?.user?.companyCode || 'error'}_tagsamurai`,
    );
    this.groupModel = connection.model('groups', GroupSchema);
  }

  async aggregateGroups(pipeline: PipelineStage[]): Promise<any[]> {
    return await this.groupModel.aggregate(pipeline);
  }

  async generateKey(): Promise<number> {
    const group = await this.groupModel
      .findOne({ key: { $exists: true } })
      .sort({ key: -1 });

    if (group?.key) {
      return group.key + 1;
    }

    return 1;
  }
  async createGroup(data: CreateGroupDTO): Promise<IGroup> {
    const key = await this.generateKey();
    return await this.groupModel.create({ ...data, key });
  }
}
