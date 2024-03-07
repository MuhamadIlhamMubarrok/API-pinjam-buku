import { Inject, Injectable, Scope } from '@nestjs/common';
import { Model } from 'mongoose';
import { IChangelog, IUser } from 'schemas';
import { CreateChangelogDTO } from '../dto/changelog.dto';
import { ChangelogSchema } from '../models/changelog.model';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { MongooseConfigService } from '../db/db.config';
import { UserSchema } from '../models/user.model';

@Injectable({ scope: Scope.REQUEST })
export class ChangelogService {
  private changelogModel: Model<IChangelog>;
  private userModel: Model<IUser>;
  constructor(
    @Inject(MongooseConfigService)
    private connectionManager: MongooseConfigService,
    @Inject(REQUEST)
    private req: Request,
  ) {
    this.setConnection();
  }
  public setConnection = async () => {
    this.changelogModel = (await this.connectionManager.getModel(
      `mongodb://127.0.0.1:27017/${this.req?.user?.companyCode || 'error'}_tagsamurai`,
      'change_logs',
      ChangelogSchema,
    )) as Model<IChangelog>;
    this.userModel = (await this.connectionManager.getModel(
      `mongodb://127.0.0.1:27017/${this.req?.user?.companyCode || 'error'}_tagsamurai`,
      'users',
      UserSchema,
    )) as Model<IUser>;
  };

  async createChangelog(data: CreateChangelogDTO): Promise<void> {
    const user = await this.userModel.findOne({ _id: this.req.user.id });
    await this.changelogModel.create({
      ...data,
      modifiedBy: `${user.firstName} ${user.lastName}`,
    });
  }
}
