import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { Model, Types, PipelineStage } from 'mongoose';
import {
  IAsset,
  IAssignmentApproval,
  IAssignmentRequest,
  IAssignmentTransaction,
  IFileDamage,
  IGroup,
  ITransactionLog,
  IUserTransactionRole,
} from 'schemas';
import { MongooseConfigService } from '../db/db.config';
import { TransactionSchema, RequestSchema } from '../models/transaction.model';
import { UpdateApprovalStatusDTO } from '../dto/transaction.dto';
import { UserTransactionRoleSchema } from '../models/userTransactionRole.model';
import { AssignmentApprovalSchema } from '../models/assignmentApproval.model';
import { TransactionLogSchema } from '../models/transactionLog.model';
import { NotificationWebsocketService } from './notification.websocket.service';
import { FileDamageSchema } from '../models/fileDamage.model';
import { IUserAssignmentLog } from 'schemas/interfaces/company/log/userAssignmentLog.interface';
import { UserAssignmentLogSchema } from '../models/userAssignLog.model';
import { GroupSchema } from '../models/group.model';

@Injectable({ scope: Scope.REQUEST })
export class ApprovalService {
  private requestModel: Model<IAssignmentRequest>;
  private transactionModel: Model<IAssignmentTransaction>;
  private assignmentApprovalModel: Model<IAssignmentApproval>;
  private transactionLogModel: Model<ITransactionLog>;
  private userAssignmentLogModel: Model<IUserAssignmentLog>;
  private groupModel: Model<IGroup>;
  private fileDamageModel: Model<IFileDamage>;
  private userTransactionRoleModel: Model<IUserTransactionRole>;

  constructor(
    @Inject(MongooseConfigService)
    private connectionManager: MongooseConfigService,
    @Inject(REQUEST)
    private req: Request,
    private readonly notificationWsClient: NotificationWebsocketService,
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
    this.fileDamageModel = (await this.connectionManager.getModel(
      `mongodb://127.0.0.1:27017/${this.req?.user?.companyCode || 'error'}_tagsamurai`,
      'file_damage',
      FileDamageSchema,
    )) as Model<IFileDamage>;
    this.userAssignmentLogModel = (await this.connectionManager.getModel(
      `mongodb://127.0.0.1:27017/${this.req?.user?.companyCode || 'error'}_tagsamurai`,
      'user_assignment_log',
      UserAssignmentLogSchema,
    )) as Model<IUserAssignmentLog>;
    this.groupModel = (await this.connectionManager.getModel(
      `mongodb://127.0.0.1:27017/${this.req?.user?.companyCode || 'error'}_tagsamurai`,
      'groups',
      GroupSchema,
    )) as Model<IGroup>;
  };

  async aggregateApprovals(pipeline: PipelineStage[]): Promise<any[]> {
    return await this.assignmentApprovalModel.aggregate(pipeline);
  }

  async approval(datas: UpdateApprovalStatusDTO[]) {
    for (const data of datas) {
      const userId = this.req.user.id;

      const updatedData: IAssignmentApproval =
        await this.assignmentApprovalModel.findOneAndUpdate(
          {
            _id: new Types.ObjectId(data.id),
            status: 'Need Approval',
            'user._id': new Types.ObjectId(userId),
          },
          {
            isApproved: data.isApproved,
            status: 'Finished Approval',
            approvedAt: data.isApproved ? new Date() : null,
            notes: data.notes,
          },
        );

      const action =
        'Level ' +
        updatedData.level.toString() +
        (data.isApproved ? ' Approved' : ' Rejected');

      await this.transactionLogModel.create({
        type: 'Assignment',
        transactionId: updatedData.transactionId,
        transaction: updatedData.request,
        action: action,
        userId: updatedData.user._id,
        userFullName: updatedData.user.fullName,
        detail: { notes: data.notes },
      });

      if (data.isApproved) {
        await this.approve(updatedData);
      } else {
        await this.reject(updatedData);
      }
    }
  }

  async approve(updatedData: IAssignmentApproval) {
    if (updatedData.type == 'And') {
      const remainApproval = await this.assignmentApprovalModel.findOne({
        request: updatedData.request,
        level: updatedData.level,
        status: 'Need Approval',
      });

      if (!remainApproval) {
        await this.finishApprovalLevel(
          String(updatedData.transaction),
          String(updatedData.request),
          updatedData.level,
        );
      }
    } else {
      await this.finishApprovalLevel(
        String(updatedData.transaction),
        String(updatedData.request),
        updatedData.level,
      );
    }
  }

  async finishApprovalLevel(
    transaction: string,
    request: string,
    level: number,
  ) {
    await this.assignmentApprovalModel.updateMany(
      {
        request,
        level,
      },
      {
        status: 'Finished Approval',
      },
    );

    const transactionStillNeedApproval =
      await this.assignmentApprovalModel.findOne({
        transaction: transaction,
        level: level,
        status: 'Need Approval',
      });
    if (transactionStillNeedApproval) {
      return;
    }

    const nextLevelApprovalData = await this.assignmentApprovalModel.findOne({
      request: request,
      level: level + 1,
      status: 'Pending',
    });
    if (nextLevelApprovalData) {
      await this.activateNextApprovalLevel(
        nextLevelApprovalData[0].level,
        String(nextLevelApprovalData[0].transaction),
      );
    } else {
      await this.approveRequest(String(request));
    }
  }

  async activateNextApprovalLevel(level: number, transaction: string) {
    await this.assignmentApprovalModel.updateMany(
      { level, transaction, status: 'Pending' },
      { status: 'Need Approval' },
    );

    //Send ke user2 dengan approval level baru
    // let pendingNotification: CreateNotificationDTO[];
    // for (const approvalData of nextLevelApprovalData) {
    //   pendingNotification.push({
    //     user: approvalData.user._id.toString(),
    //     title: 'Waiting for Assignment Approval',
    //     detail: updatedData.transactionId,
    //     isReadOnly: true,
    //     isManager: false,
    //     severity: 'warning',
    //     data: {
    //       transaction: updatedData.transaction,
    //       request: updatedData.request,
    //     },
    //   });
    // }
    // this.notificationWsClient.sendNotification(
    //   this.req.user.companyCode,
    //   pendingNotification,
    // );
  }

  async approveRequest(request: string) {
    const updated = await this.requestModel.findOneAndUpdate(
      { _id: request },
      { status: 'Approved' },
    );

    const requestStillWaitingApproval = await this.requestModel.findOne({
      transaction: updated.transaction,
      status: 'Waiting for Approval',
    });
    if (!requestStillWaitingApproval) {
      await this.finishTransactionApproval(String(updated.transaction));
    }
  }

  async finishTransactionApproval(transaction: string) {
    await this.requestModel.updateMany(
      { transaction, status: 'Approved' },
      { status: 'Waiting for Handover' },
    );
    await this.transactionModel.updateOne(
      { _id: transaction },
      { status: 'Waiting for Handover' },
    );
  }

  async reject(updatedData: IAssignmentApproval) {
    if (updatedData.type == 'Or') {
      const remainApproval = await this.assignmentApprovalModel.findOne({
        request: updatedData.request,
        level: updatedData.level,
        status: 'Need Approval',
      });

      if (!remainApproval) {
        await this.rejectRequest(
          String(updatedData.transaction),
          String(updatedData.request),
          updatedData.level,
        );
      }
    } else {
      await this.rejectRequest(
        String(updatedData.transaction),
        String(updatedData.request),
        updatedData.level,
      );
    }
    //   updatedData.transaction,
    // );

    // let pendingNotification: CreateNotificationDTO[];

    // pendingNotification.push({
    //   user: transactionData.manager._id.toString(),
    //   title: 'Assignment Request Rejected',
    //   detail: updatedData.transactionId,
    //   isReadOnly: true,
    //   isManager: true,
    //   severity: 'danger',
    //   data: {
    //     transaction: updatedData.transaction,
    //     request: updatedData.request,
    //   },
    // });

    // const managers: IUserTransactionRole[] = await this.getManagersPerRole(
    //   transactionData.group._id,
    //   'borrowingRole',
    // );
    // for (const manager of managers) {
    //   pendingNotification.push({
    //     user: manager.user._id.toString(),
    //     title: 'Assigment Request Rejected',
    //     detail: updatedData.transactionId,
    //     isReadOnly: true,
    //     isManager: true,
    //     severity: 'danger',
    //     data: {
    //       transaction: updatedData.transaction,
    //       request: updatedData.request,
    //     },
    //   });
    // }
    // this.notificationWsClient.sendNotification(
    //   this.req.user.companyCode,
    //   pendingNotification,
    // );
  }

  async rejectRequest(transaction: string, request: string, level: number) {
    await this.assignmentApprovalModel.updateMany(
      {
        request,
        level,
      },
      {
        status: 'Finished Approval',
      },
    );

    await this.requestModel.updateOne(
      { transaction, _id: request },
      { status: 'Rejected' },
    );

    const transactionStillNeedApproval =
      await this.assignmentApprovalModel.findOne({
        transaction: transaction,
        level: level,
        status: 'Need Approval',
      });
    if (!transactionStillNeedApproval) {
      await this.rejectTransactionApproval(String(transaction));
    }
  }

  async rejectTransactionApproval(transaction: string) {
    await this.transactionModel.updateOne(
      { _id: transaction },
      { status: 'Rejected' },
    );
  }
}
