import { Inject, Injectable, Scope } from '@nestjs/common';
import { Model, FilterQuery } from 'mongoose';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { MongooseConfigService } from '../db/db.config';
import { UsersSchema } from '../models/user.model';
import { IUser } from 'schemas';

@Injectable({ scope: Scope.REQUEST })
export class UserService {
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
    this.userModel = (await this.connectionManager.getModel(
      `mongodb://127.0.0.1:27017/${this.req?.user?.companyCode || 'error'}_tagsamurai`,
      'user',
      UsersSchema,
    )) as Model<IUser>;
  };

  async getOneUser(filter: FilterQuery<IUser>): Promise<IUser> {
    return this.userModel.findOne(filter);
  }
}
