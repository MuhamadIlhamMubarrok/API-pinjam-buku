import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';
<<<<<<< HEAD:src/services/role.service.ts
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
=======
import { IGroup } from 'schemas';
import { CreateGroupDTO } from 'src/dto/group.dto';

@Injectable()
export class GroupService {
  constructor(
    @InjectModel('groups', 'companyConnection')
    private groupModel: Model<IGroup>,
  ) {}
>>>>>>> parent of f638c27 (feat: add request scoped service with connection):src/services/group.service.ts

  async aggregateGroups(pipeline: PipelineStage[]) {
    return await this.roleModel.aggregate(pipeline);
  }
<<<<<<< HEAD:src/services/role.service.ts

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
=======
  async createGroup(data: CreateGroupDTO): Promise<IGroup> {
    return await this.groupModel.create(data);
>>>>>>> parent of f638c27 (feat: add request scoped service with connection):src/services/group.service.ts
  }
}
