import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { Model, Types, PipelineStage } from 'mongoose';
import {
  IAsset,
  IAssignmentPrelist,
  IAssignmentPrelistRequest,
  IUser,
} from 'schemas';
import { MongooseConfigService } from '../db/db.config';
import { NotFound } from 'utils';
import { AssetSchema } from '../models/asset.model';
import { UserSchema } from '../models/user.model';
import { AssignmentPrelistSchema } from '../models/assignmentPrelist.model';
import { AssignmentPrelistRequestSchema } from '../models/assignmentPrelistRequest.model';
import { CreatePrelistDTO } from '../dto/prelist.dto';

@Injectable({ scope: Scope.REQUEST })
export class PrelistService {
  private prelistModel: Model<IAssignmentPrelist>;
  private PrelistRequestModel: Model<IAssignmentPrelistRequest>;
  private assetModel: Model<IAsset>;
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
    this.prelistModel = (await this.connectionManager.getModel(
      `mongodb://127.0.0.1:27017/${this.req?.user?.companyCode || 'error'}_tagsamurai`,
      'assignment_prelist',
      AssignmentPrelistSchema,
    )) as Model<IAssignmentPrelist>;

    this.PrelistRequestModel = (await this.connectionManager.getModel(
      `mongodb://127.0.0.1:27017/${this.req?.user?.companyCode || 'error'}_tagsamurai`,
      'assignment_prelist_request',
      AssignmentPrelistRequestSchema,
    )) as Model<IAssignmentPrelistRequest>;

    this.assetModel = (await this.connectionManager.getModel(
      `mongodb://127.0.0.1:27017/${this.req?.user?.companyCode || 'error'}_tagsamurai`,
      'asset',
      AssetSchema,
    )) as Model<IAsset>;
    this.userModel = (await this.connectionManager.getModel(
      `mongodb://127.0.0.1:27017/${this.req?.user?.companyCode || 'error'}_tagsamurai`,
      'user',
      UserSchema,
    )) as Model<IUser>;
  };

  async aggregatePrelist(pipeline: PipelineStage[]): Promise<any[]> {
    return await this.prelistModel.aggregate(pipeline);
  }

  async aggregatePrelistRequest(pipeline: PipelineStage[]): Promise<any[]> {
    return await this.PrelistRequestModel.aggregate(pipeline);
  }

  async createPrelist(data: CreatePrelistDTO) {
    const assignedUser: IUser = await this.userModel.findById(data.user);
    if (!assignedUser) {
      throw new NotFound('User not found');
    }

    const loggedInUser: IUser = await this.userModel.findById(this.req.user.id);

    data.id = data.id.map((x) => {
      return new Types.ObjectId(x);
    });
    const assetData = await this.assetModel.aggregate([
      {
        $match: {
          _id: { $in: data.id },
        },
      },
      {
        $group: {
          _id: '$group',
          data: {
            $push: {
              asset: '$_id',
              assetName: '$name',
              assetImageBig: '$firstImageSmall',
              assetImageMedium: '$firstImageMedium',
              assetImageSmall: '$firstImageBig',
              assetBrand: '$brand',
              assetModel: '$model',
              assetGroup: '$group',
              assetTagType: '$tagType',
              assetQr: { $cond: [{ $eq: ['$qr', null] }, false, true] },
              assetRfid: { $cond: [{ $eq: ['$rfid', null] }, false, true] },
            },
          },
        },
      },
    ]);

    let totalAsset = 0;

    assetData.forEach((x) => (totalAsset += x.data.length));
    if (totalAsset != data.id.length) {
      throw new Error('invalid one or more asset id');
    }

    for (const assetPerGroup of assetData) {
      const PrelistData: IAssignmentPrelist = await this.prelistModel.create({
        manager: {
          _id: loggedInUser._id,
          fullName: loggedInUser.firstName + ' ' + loggedInUser.lastName,
          key: loggedInUser.key,
        },
        group: assetPerGroup._id,
        assignedTo: {
          _id: assignedUser._id,
          fullName: assignedUser.firstName + ' ' + assignedUser.lastName,
          key: assignedUser.key,
        },
        totalAssets: assetPerGroup.data.length,
      });
      const pendingPrelist = [];
      for (const assetData of assetPerGroup.data) {
        pendingPrelist.push({
          prelist: PrelistData._id,
          ...assetData,
        });
        await this.PrelistRequestModel.insertMany(pendingPrelist);
      }
    }
  }
}
