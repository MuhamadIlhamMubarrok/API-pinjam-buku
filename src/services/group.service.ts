import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';
import { IGroup } from 'schemas';
import { CreateGroupDTO } from 'src/dto/group.dto';

@Injectable()
export class GroupService {
  constructor(
    @InjectModel('groups', 'companyConnection')
    private groupModel: Model<IGroup>,
  ) {}

  async aggregateGroups(pipeline: PipelineStage[]) {
    return await this.groupModel.aggregate(pipeline);
  }
  async createGroup(data: CreateGroupDTO): Promise<IGroup> {
    return await this.groupModel.create(data);
  }
}
