import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { Model, Types, PipelineStage } from 'mongoose';
import {
  IAssignmentApproval,
  IAssignmentRequest,
  IAssignmentTransaction,
  IUserTransactionRole,
} from 'schemas';
import { MongooseConfigService } from '../db/db.config';
import { TransactionSchema, RequestSchema } from '../models/transaction.model';
import {
  CreateTransactionDTO,
  UpdateApprovalStatusDTO,
} from '../dto/transaction.dto';
import { groupBy, getCurrentDate, NotFound } from 'utils';
import { UserTransactionRoleSchema } from '../models/userTransactionRole.model';
import { AssignmentApprovalSchema } from 'src/models/assignmentApproval.model';

@Injectable({ scope: Scope.REQUEST })
export class TransactionService {
  private requestModel: Model<IAssignmentRequest>;
  private transactionModel: Model<IAssignmentTransaction>;
  private userTransactionRoleModel: Model<IUserTransactionRole>;
  private assignmentApprovalModel: Model<IAssignmentApproval>;
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
    this.userTransactionRoleModel = (await this.connectionManager.getModel(
      `mongodb://127.0.0.1:27017/${this.req?.user?.companyCode || 'error'}_tagsamurai`,
      'user_transaction_role',
      UserTransactionRoleSchema,
    )) as Model<IUserTransactionRole>;
    this.assignmentApprovalModel = (await this.connectionManager.getModel(
      `mongodb://127.0.0.1:27017/${this.req?.user?.companyCode || 'error'}_tagsamurai`,
      'assignment_approval',
      AssignmentApprovalSchema,
    )) as Model<IAssignmentApproval>;
  };

  async aggregateApprovals(pipeline: PipelineStage[]): Promise<any[]> {
    return await this.assignmentApprovalModel.aggregate(pipeline);
  }

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
          assetData.assetName.nameWithSequence = assetData.assetName.name;
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
          const approvers = await this.userTransactionRoleModel.find({
            'group._id': new Types.ObjectId(assetData.assetGroup._id),
            transactionGroupAttribute: 'borrowingRole',
            roleType: 'Approval',
          });
          if (approvers.length == 0) {
            await this.requestModel.findByIdAndUpdate(request._id, {
              status: 'Waiting for Handover',
            });
            await this.transactionModel.findByIdAndUpdate(transaction._id, {
              status: 'Waiting for Handover',
            });
          } else {
            for (const approver of approvers) {
              let status = 'Need Approval';
              if (approver.approvalLevel > 1) {
                status = 'Pending';
              }
              await this.assignmentApprovalModel.create({
                user: approver.user._id,
                level: approver.approvalLevel,
                request: request._id,
                transaction: transaction._id,
                transactionId: transactionId,
                assignedTo: transaction.assignedTo,
                manager: transaction.manager,
                totalAssets: 1,
                isApproved: null,
                status: status,
                type: approver.approvalType,
                createdAt: new Date(),
              });
            }
          }
        }
      }
    }
  }

  async cancelTransaction(id: string) {
    const transactionResult = await this.transactionModel.findByIdAndUpdate(
      id,
      {
        status: 'Cancelled',
      },
    );

    await this.requestModel.updateMany(
      {
        transaction: new Types.ObjectId(id),
      },
      {
        status: 'Cancelled',
      },
    );

    await this.assignmentApprovalModel.updateMany(
      {
        transaction: new Types.ObjectId(id),
      },
      {
        status: 'Cancelled',
      },
    );

    return transactionResult;
  }

  async cancelRequest(id: string[]) {
    const ids = id.map((value) => new Types.ObjectId(value));

    const requestResult = await this.requestModel.updateMany(
      { _id: { $in: ids } },
      {
        status: 'Cancelled',
      },
    );
    await this.assignmentApprovalModel.updateMany(
      {
        request: { $in: ids },
      },
      { status: 'Finished Approval' },
    );

    return requestResult;
  }

  async handoverTransaction(id: string) {
    const isNotWaitingForHandover = await this.requestModel.find({
      transaction: new Types.ObjectId(id),
      status: { $ne: 'Waiting for Handover' },
    });

    if (isNotWaitingForHandover.length > 0) {
      return {};
    }

    const transactionResult = await this.transactionModel.findByIdAndUpdate(
      id,
      {
        status: 'Assigned',
      },
    );

    await this.requestModel.updateMany(
      {
        transaction: new Types.ObjectId(id),
      },
      {
        status: 'Assigned',
      },
    );

    return transactionResult;
  }

  async updateApprovalStatus(userId: string, data: UpdateApprovalStatusDTO) {
    const checkData = await this.assignmentApprovalModel.findOne({
      _id: new Types.ObjectId(data.id),
      user: new Types.ObjectId(userId),
    });

    if (!checkData) {
      throw new NotFound('AssignmentApproval data could not be found');
    }
    if (checkData.status != 'Need Approval') {
      throw new Error('could not update this approval data');
    }

    const updatedData: IAssignmentApproval =
      await this.assignmentApprovalModel.findByIdAndUpdate(data.id, {
        isApproved: data.isApproved,
        status: 'Finished Approval',
      });

    // if user accept
    if (data.isApproved) {
      // if approval type is "and"
      if (updatedData.type == 'And') {
        const remainApproval = await this.assignmentApprovalModel.find({
          request: updatedData.request,
          level: updatedData.level,
          status: 'Need Approval',
        });

        // check if there is user that is not approve yet
        if (remainApproval.length != 0) {
          return {};
        }
      }

      // if approval type is "or"
      if (updatedData.type == 'Or') {
        await this.assignmentApprovalModel.updateMany(
          {
            request: updatedData.request,
            level: updatedData.level,
          },
          {
            status: 'Finished Approval',
          },
        );
      }
      const updateNextLevelApproval =
        await this.assignmentApprovalModel.updateMany(
          {
            request: updatedData.request,
            level: updatedData.level + 1,
          },
          {
            status: 'Need Approval',
          },
        );

      // check if there is there is next level approvals
      if (updateNextLevelApproval.modifiedCount != 0) {
        return {};
      }

      await this.requestModel.findByIdAndUpdate(updatedData.request, {
        status: 'Approved',
      });

      return {};
    }

    // if user reject
    if (!data.isApproved) {
      // if approval type is "or"
      if (updatedData.type == 'Or') {
        const remainApproval = await this.assignmentApprovalModel.find({
          request: updatedData.request,
          level: updatedData.level,
          status: 'Need Approval',
        });

        // check if there is user that is not approve yet
        if (remainApproval.length != 0) {
          return {};
        }
      }
      await this.assignmentApprovalModel.updateMany(
        {
          request: updatedData.request,
        },
        { status: 'Finished Approval' },
      );

      await this.requestModel.findByIdAndUpdate(updatedData.request, {
        status: 'Rejected',
      });
      return {};
    }
  }
}
