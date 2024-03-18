import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { Model } from 'mongoose';
import {
  IAssignmentRequest,
  IAssignmentTransaction,
  IUserTransactionRole,
} from 'schemas';
import { MongooseConfigService } from '../db/db.config';
import { TransactionSchema, RequestSchema } from '../models/transaction.model';
import { CreateTransactionDTO } from '../dto/transaction.dto';
import { groupBy, getCurrentDate } from 'utils';
import { UserTransactionRoleSchema } from '../models/userTransactionRole.model';

@Injectable({ scope: Scope.REQUEST })
export class TransactionService {
  private requestModel: Model<IAssignmentRequest>;
  private transactionModel: Model<IAssignmentTransaction>;
  private userTransactionRole: Model<IUserTransactionRole>;
  constructor(
    @Inject(MongooseConfigService)
    private connectionManager: MongooseConfigService,
    @Inject(REQUEST)
    private req: Request,
  ) {
    this.setConnection();
  }

  public setConnection = async () => {
    this.transactionModel = (await this.connectionManager.getModel(
      `mongodb://127.0.0.1:27017/${this.req?.user?.companyCode || 'error'}_tagsamurai`,
      'assignment_transaction',
      TransactionSchema,
    )) as Model<IAssignmentTransaction>;
    this.requestModel = (await this.connectionManager.getModel(
      `mongodb://127.0.0.1:27017/${this.req?.user?.companyCode || 'error'}_tagsamurai`,
      'assignment_request',
      RequestSchema,
    )) as Model<IAssignmentRequest>;
    this.userTransactionRole = (await this.connectionManager.getModel(
      `mongodb://127.0.0.1:27017/${this.req?.user?.companyCode || 'error'}_tagsamurai`,
      'user_transaction_role',
      UserTransactionRoleSchema,
    )) as Model<IUserTransactionRole>;
  };

  async generateTransactionId() {
    const currentDate = getCurrentDate();
    const lastTransaction = await this.transactionModel
      .findOne({
        transactionId: { $regex: `(?i)${currentDate}` },
      })
      .sort({ transactionId: -1 });

    if (lastTransaction) {
      const lastNumber = parseInt(lastTransaction.transactionId.split('-')[2]);
      return `ASG-${currentDate}-${(lastNumber + 1)
        .toString()
        .padStart(4, '0')}`;
    }

    return `ASG-${currentDate}-0001`;
  }

  async createTransaction(body: CreateTransactionDTO[]) {
    const groupedTransactionByGroup = await groupBy(
      body as any[],
      'assetGroup._id',
    );
    for (const groupId of Object.keys(groupedTransactionByGroup)) {
      const groupedDataByUser = await groupBy(
        groupedTransactionByGroup[groupId],
        'user._id',
      );
      for (const userId of Object.keys(groupedDataByUser)) {
        const assets = groupedDataByUser[userId];

        const transactionId = await this.generateTransactionId();
        const transaction = await this.transactionModel.create({
          transactionId,
          manager: {
            _id: '65ea6fc61f39f83ef63583ed',
            fullName: 'string',
            key: 1,
          },
          group: { _id: '65ea6fc61f39f83ef63583ed', name: 'string', key: 1 },
          assignedTo: {
            _id: '65ea6fc61f39f83ef63583ed',
            fullName: 'string',
            key: 1,
          },
        });
        for (const assetData of assets) {
          const request = await this.requestModel.create({
            transaction,
            asset: assetData.asset,
            assetName: assetData.assetName,
            assetGroup: assetData.assetGroup,
            assetBrand: assetData.assetBrand,
            assetModel: assetData.assetModel,
            assignedTo: assetData.user,
          });

          //await this.createApprovals(request)
        }
      }
    }
  }

  // async createApprovals(request: IAssignmentRequest){
  //   const approvalRoles =
  // }
}
