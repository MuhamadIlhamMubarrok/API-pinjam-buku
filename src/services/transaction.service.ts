import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { Model, Types, PipelineStage } from 'mongoose';
import {
  IAssignmentApproval,
  IAssignmentRequest,
  IAssignmentTransaction,
  ITransactionLog,
  IUserTransactionRole,
} from 'schemas';
import { MongooseConfigService } from '../db/db.config';
import { TransactionSchema, RequestSchema } from '../models/transaction.model';
import {
  CreateTransactionDTO,
  UpdateApprovalStatusDTO,
} from '../dto/transaction.dto';
import { groupBy, getCurrentDate, NotFound, Forbidden } from 'utils';
import { UserTransactionRoleSchema } from '../models/userTransactionRole.model';
import { AssignmentApprovalSchema } from 'src/models/assignmentApproval.model';
import { TransactionLogSchema } from 'src/models/transactionLog.model';

@Injectable({ scope: Scope.REQUEST })
export class TransactionService {
  private requestModel: Model<IAssignmentRequest>;
  private transactionModel: Model<IAssignmentTransaction>;
  private userTransactionRoleModel: Model<IUserTransactionRole>;
  private assignmentApprovalModel: Model<IAssignmentApproval>;
  private transactionLogModel: Model<ITransactionLog>;
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
    this.transactionLogModel = (await this.connectionManager.getModel(
      `mongodb://127.0.0.1:27017/${this.req?.user?.companyCode || 'error'}_tagsamurai`,
      'transaction_log',
      TransactionLogSchema,
    )) as Model<ITransactionLog>;
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

          await this.transactionLogModel.create({
            type: 'Assignment',
            transactionId: transactionId,
            transaction: request._id,
            assetId: assetData.asset,
            assetName: assetData.assetName.nameWithSequence,
            action: 'Assignment requested',
            userId: transaction.manager._id,
            userFullName: transaction.manager.fullName,
          });
          await this.createApprovals(transaction, request);
        }
      }
    }
  }

  async createApprovals(
    transaction: IAssignmentTransaction,
    request: IAssignmentRequest,
  ) {
    const approvers = await this.userTransactionRoleModel.find({
      'group._id': new Types.ObjectId(transaction.group._id),
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
          transactionId: transaction.transactionId,
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

  async cancelTransaction(id: string, userId: string) {
    const transactionData = await this.transactionModel.findById(id);
    const isManager = await this.isManager(
      transactionData.group._id.toString(),
      userId,
    );

    if (!isManager) {
      throw new Forbidden('user does not have access');
    }

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

    const relatedTransactionLogs = await this.transactionLogModel.find({
      transactionId: transactionResult.transactionId,
    });

    for (const transactionLog of relatedTransactionLogs) {
      delete transactionLog['_id'];
      delete transactionLog['createdAt'];
      transactionLog.action = 'Cancelled';
      transactionLog.userId = new Types.ObjectId(userId);
      transactionLog.userFullName = isManager.user.fullName;

      await this.transactionLogModel.create(transactionLog);
    }

    return transactionResult;
  }

  async cancelRequest(id: string[], userId: string) {
    const ids = id.map((value) => new Types.ObjectId(value));

    for (const id of ids) {
      const requestData = await this.requestModel.findById(id);
      const transactionData = await this.transactionModel.findById(
        requestData.transaction,
      );

      const isManager: IUserTransactionRole = await this.isManager(
        transactionData.group._id.toString(),
        userId,
      );

      if (!isManager) {
        continue;
      }

      const requestResult = await this.requestModel.findByIdAndUpdate(id, {
        status: 'Cancelled',
      });
      await this.assignmentApprovalModel.updateMany(
        {
          request: id,
        },
        { status: 'Finished Approval' },
      );

      await this.transactionLogModel.create({
        type: 'Assignment',
        transactionId: transactionData.transactionId,
        transaction: requestResult._id,
        assetId: requestResult.asset,
        assetName: requestResult.assetName.nameWithSequence,
        action: 'Cancelled',
        userId: isManager.user._id,
        userFullName: isManager.user.fullName,
      });
    }

    return {};
  }

  async handoverTransaction(transactionId: string, userId: string) {
    const isNotWaitingForHandover = await this.requestModel.find({
      transaction: new Types.ObjectId(transactionId),
      status: { $ne: 'Waiting for Handover' },
    });

    if (isNotWaitingForHandover.length > 0) {
      throw new Error(
        "related request status has not fully 'Waiting for Handover'",
      );
    }

    const transactionData = await this.transactionModel.findById(transactionId);

    if (!transactionData.confirmationEmailConfirmed) {
      throw new Error('email has not confirmed');
    }

    const isManager: IUserTransactionRole = await this.isManager(
      transactionData.group._id.toString(),
      userId,
    );

    if (!isManager) {
      throw new Forbidden('user does not have access');
    }

    const transactionResult = await this.transactionModel.findByIdAndUpdate(
      transactionId,
      {
        status: 'Assigned',
      },
    );

    const relatedRequestData = await this.requestModel.find({
      transaction: new Types.ObjectId(transactionId),
    });

    for (const requestData of relatedRequestData) {
      const updatedRequestData = await this.requestModel.findByIdAndUpdate(
        requestData._id,
        {
          status: 'Assigned',
        },
      );

      await this.transactionLogModel.create({
        type: 'Assignment',
        transactionId: transactionResult.transactionId,
        transaction: updatedRequestData._id,
        assetId: updatedRequestData.asset,
        assetName: updatedRequestData.assetName.nameWithSequence,
        action: 'Handed over',
        userId: userId,
        userFullName: isManager.user.fullName,
      });
    }

    return transactionResult;
  }

  async approveRequest(userId: string, data: UpdateApprovalStatusDTO) {
    const checkData: IAssignmentApproval =
      await this.assignmentApprovalModel.findOne({
        _id: new Types.ObjectId(data.id),
        'user._id': new Types.ObjectId(userId),
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

    const action =
      'Level ' +
      updatedData.level.toString() +
      (data.isApproved ? ' approved' : ' disapprove');

    await this.transactionLogModel.create({
      type: 'Assignment',
      transactionId: updatedData.transactionId,
      transaction: updatedData.request,
      action: action,
      userId: updatedData.user._id,
      userFullName: updatedData.user.fullName,
    });

    // if user accept
    if (data.isApproved) {
      this.approvedStatusChainingEffect(updatedData);
      return {};
    }

    // if user reject
    else {
      this.rejectedStatusChainingEffect(updatedData);
      return {};
    }
  }

  async approvedStatusChainingEffect(updatedData: IAssignmentApproval) {
    // if approval type is "and"
    if (updatedData.type == 'And') {
      const remainApproval = await this.assignmentApprovalModel.find({
        request: updatedData.request,
        level: updatedData.level,
        status: 'Need Approval',
      });

      // check if there is user that is not approve yet
      if (remainApproval.length != 0) {
        return;
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
      return;
    }

    await this.requestModel.findByIdAndUpdate(updatedData.request, {
      status: 'Approved',
    });
  }

  async rejectedStatusChainingEffect(updatedData: IAssignmentApproval) {
    // if approval type is "or"
    if (updatedData.type == 'Or') {
      const remainApproval = await this.assignmentApprovalModel.find({
        request: updatedData.request,
        level: updatedData.level,
        status: 'Need Approval',
      });

      // check if there is user that is not approve yet
      if (remainApproval.length != 0) {
        return;
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
  }

  async ReportRequest(
    userId: string,
    requestId: string,
    report: string,
    note?: string,
  ) {
    let userFullName;
    let newStatus = 'Report ' + report;

    const requestData: IAssignmentRequest =
      await this.requestModel.findById(requestId);

    if (!requestData) {
      throw new NotFound('request data could not be found');
    }

    const tranasctionData: IAssignmentTransaction =
      await this.transactionModel.findById(requestData.transaction);

    let result: IAssignmentRequest;
    if (userId == tranasctionData.assignedTo._id) {
      userFullName = tranasctionData.assignedTo.fullName;
      newStatus = newStatus + ' by User';
      result = await this.requestModel.findByIdAndUpdate(requestId, {
        status: newStatus,
      });
    } else {
      const isManager: IUserTransactionRole = await this.isManager(
        tranasctionData.group._id.toString(),
        userId,
      );

      if (!isManager) {
        throw new Forbidden('user does not have access');
      }
      userFullName = isManager.user.fullName;

      result = await this.requestModel.findByIdAndUpdate(requestId, {
        status: newStatus,
      });
    }

    await this.transactionLogModel.create({
      type: 'Assignment',
      transactionId: tranasctionData.transactionId,
      transaction: requestData._id,
      action: newStatus,
      userId: new Types.ObjectId(userId),
      userFullName: userFullName,
    });

    return result;
  }

  async isManager(groupId: string, userId: string) {
    return await this.userTransactionRoleModel.findOne({
      'group._id': new Types.ObjectId(groupId),
      transactionGroupAttribute: 'borrowingRole',
      'user._id': new Types.ObjectId(userId),
      roleType: 'Manager',
      isActive: true,
    });
  }

  async getTransactionLogList(requestId: string) {
    return await this.transactionLogModel.find({
      transaction: new Types.ObjectId(requestId),
    });
  }
}
