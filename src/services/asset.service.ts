/* eslint-disable sonarjs/no-identical-functions */
import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { Model, FilterQuery } from 'mongoose';
import { IAsset } from 'schemas';
import { MongooseConfigService } from '../db/db.config';
import { AssetSchema } from '../models/asset.model';

@Injectable({ scope: Scope.REQUEST })
export class AssetService {
  private assetModel: Model<IAsset>;
  constructor(
    @Inject(MongooseConfigService)
    private connectionManager: MongooseConfigService,
    @Inject(REQUEST)
    private req: Request,
  ) {
    this.setConnection();
  }

  public setConnection = async () => {
    this.assetModel = (await this.connectionManager.getModel(
      `mongodb://127.0.0.1:27017/${this.req?.user?.companyCode || 'error'}_tagsamurai`,
      'assets',
      AssetSchema,
    )) as Model<IAsset>;
  };

  async getOneAsset(filter: FilterQuery<IAsset>) {
    return await this.assetModel.findOne(filter);
  }
}
