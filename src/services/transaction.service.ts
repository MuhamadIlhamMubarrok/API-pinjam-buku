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
import {
  CreateNotificationDTO,
  CreateTransactionDTO,
  UpdateApprovalStatusDTO,
} from '../dto/transaction.dto';
import {
  groupBy,
  getCurrentDate,
  NotFound,
  Forbidden,
  Unauthorized,
  isManager,
} from 'utils';
import { UserTransactionRoleSchema } from '../models/userTransactionRole.model';
import { AssignmentApprovalSchema } from '../models/assignmentApproval.model';
import { TransactionLogSchema } from '../models/transactionLog.model';
import { NotificationWebsocketService } from './notification.websocket.service';
import { FileDamageSchema } from '../models/fileDamage.model';
import { IUserAssignmentLog } from 'schemas/interfaces/company/log/userAssignmentLog.interface';
import { UserAssignmentLogSchema } from '../models/userAssignLog.model';
import { GroupSchema } from '../models/group.model';

@Injectable({ scope: Scope.REQUEST })
export class TransactionService {
  private requestModel: Model<IAssignmentRequest>;
  private transactionModel: Model<IAssignmentTransaction>;
  private userTransactionRoleModel: Model<IUserTransactionRole>;
  private assignmentApprovalModel: Model<IAssignmentApproval>;
  private transactionLogModel: Model<ITransactionLog>;
  private assetModel: Model<IAsset>;
  private fileDamageModel: Model<IFileDamage>;
  private userAssignmentLogModel: Model<IUserAssignmentLog>;
  private groupModel: Model<IGroup>;
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

          await this.createApproval(transaction, request);
        }

        await this.updateTransactionStatus(transaction._id);
      }
    }
  }

  async createApproval(
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

      // const managers: IUserTransactionRole[] = await this.getManagersPerRole(
      //   transaction.group._id,
      //   'borrowingRole',
      // );
    } else {
      const newAssignmentApprovalData = [];
      // let pendingNotification = [];
      for (const approver of approvers) {
        let status;
        if (approver.approvalLevel == 1) {
          status = 'Need Approval';

          // pendingNotification.push({
          //   user: approver.user._id.toString(),
          //   title: 'Waiting for Assignment Approval',
          //   detail: transaction.transactionId,
          //   isReadOnly: true,
          //   isManager: false,
          //   severity: 'warning',
          //   data: {
          //     transaction: request.transaction,
          //     request: request._id,
          //   },
          // });
        } else {
          status = 'Pending';
        }
        newAssignmentApprovalData.push({
          user: approver.user._id,
          level: approver.approvalLevel,
          request: request._id,
          transaction: transaction._id,
          transactionId: transaction.transactionId,
          assignedTo: transaction.assignedTo,
          manager: transaction.manager,
          totalAssets: 1,
          isApproved: null,
          approvedAt: null,
          status: status,
          type: approver.approvalType,
          createdAt: new Date(),
        });
      }
      await this.assignmentApprovalModel.insertMany(newAssignmentApprovalData);

      // this.notificationWsClient.sendNotification(this.req.user.companyCode, pendingNotification);
    }
  }

  async cancelTransaction(id: string) {
    const userId = this.req.user.id;
    const transactionData = await this.transactionModel.findById(id);
    const manager: IUserTransactionRole = await isManager(
      this.groupModel,
      this.userTransactionRoleModel,
      transactionData.group._id,
      userId,
      'borrowingRole',
      ['Manager'],
    );

    if (!manager) {
      throw new Unauthorized('You are not a borrowing manager');
    }

    const transactionResult = await this.transactionModel
      .findByIdAndUpdate(
        id,
        {
          status: 'Cancelled',
        },
        { new: true },
      )
      .select({
        _id: 1,
        transactionId: 1,
        manager: 1,
        group: 1,
        assignedTo: 1,
        status: 1,
      });

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

    const relatedRequestDatas = await this.requestModel.find({
      transaction: new Types.ObjectId(id),
      status: 'Cancelled',
    });

    const newTransactionLogData = [];
    for (const requestData of relatedRequestDatas) {
      newTransactionLogData.push({
        type: 'Assignment',
        transactionId: transactionData.transactionId,
        transaction: requestData.transaction,
        assetId: requestData.asset,
        assetName: requestData.assetName.nameWithSequence,
        action: 'Cancelled',
        userId: manager.user._id,
        userFullName: manager.user.fullName,
      });
    }

    await this.transactionLogModel.insertMany(newTransactionLogData);

    return transactionResult;
  }

  async cancelRequest(id: string[]) {
    const userId = this.req.user.id;
    const ids = id.map((value) => new Types.ObjectId(value));

    for (const id of ids) {
      const requestData = await this.requestModel.findById(id);
      const transactionData = await this.transactionModel.findById(
        requestData.transaction,
      );

      const manager: IUserTransactionRole = await isManager(
        this.groupModel,
        this.userTransactionRoleModel,
        transactionData.group._id,
        userId,
        'borrowingRole',
        ['Manager'],
      );

      if (!manager) {
        throw new Unauthorized('You are not a borrowing manager');
      }
      const requestResult = await this.requestModel
        .findByIdAndUpdate(id, {
          status: 'Cancelled',
        })
        .select({ _id: 1, transaction: 1, asset: 1, assetName: 1, status: 1 });

      await this.updateTransactionStatus(requestResult.transaction);

      await this.assignmentApprovalModel.updateMany(
        {
          request: id,
        },
        { status: 'Cancelled' },
      );

      await this.transactionLogModel.create({
        type: 'Assignment',
        transactionId: transactionData.transactionId,
        transaction: requestResult._id,
        assetId: requestResult.asset,
        assetName: requestResult.assetName.nameWithSequence,
        action: 'Cancelled',
        userId: manager.user._id,
        userFullName: manager.user.fullName,
      });
    }
  }

  async handoverTransaction(transactionId: string) {
    const userId = this.req.user.id;
    const transactionData = await this.transactionModel.findById(transactionId);

    if (!transactionData.confirmationEmailConfirmed) {
      throw new Error('email has not confirmed');
    }

    if (transactionData.status != 'Waiting for Handover') {
      throw new Error('transaction status is not "waiting for handover"');
    }

    const manager: IUserTransactionRole = await isManager(
      this.groupModel,
      this.userTransactionRoleModel,
      transactionData.group._id,
      userId,
      'borrowingRole',
      ['Manager'],
    );

    if (!manager) {
      throw new Unauthorized('You are not a borrowing manager');
    }

    await this.requestModel.updateMany(
      {
        transaction: new Types.ObjectId(transactionId),
        status: 'Waiting for Handover',
      },
      {
        status: 'Assigned',
      },
    );

    const transactionResult = await this.transactionModel
      .findByIdAndUpdate(
        transactionId,
        {
          status: 'Assigned',
        },
        { new: true },
      )
      .select({
        _id: 1,
        manager: 1,
        group: 1,
        assignedTo: 1,
        transactionId: 1,
        status: 1,
        createdAt: 1,
        updatedAt: 1,
      });

    const relatedRequestData = await this.requestModel.find({
      transaction: new Types.ObjectId(transactionId),
      status: 'Assigned',
    });

    const newTransactionLogData = [];

    for (const requestData of relatedRequestData) {
      newTransactionLogData.push({
        type: 'Assignment',
        transactionId: transactionResult.transactionId,
        transaction: requestData._id,
        assetId: requestData.asset,
        assetName: requestData.assetName.nameWithSequence,
        action: 'Handed over',
        userId: userId,
        userFullName: manager.user.fullName,
      });
    }

    await this.transactionLogModel.insertMany(newTransactionLogData);

    // let pendingNotification: CreateNotificationDTO[];

    // pendingNotification.push({
    //   user: transactionResult.assignedTo._id.toString(),
    //   title: 'Asset has been Assigned',
    //   detail: transactionResult.transactionId,
    //   isReadOnly: true,
    //   isManager: true,
    //   severity: 'info ',
    //   data: {
    //     transaction: transactionResult._id,
    //   },
    // });

    // const managers: IUserTransactionRole[] = await this.getManagersPerRole(
    //   transactionResult.group._id,
    //   'borrowingRole',
    // );
    // for (const manager of managers) {
    //   pendingNotification.push({
    //     user: manager.user._id.toString(),
    //     title: 'Asset has been Assigned',
    //     detail: transactionResult.transactionId,
    //     isReadOnly: true,
    //     isManager: true,
    //     severity: 'info ',
    //     data: {
    //       transaction: transactionResult._id,
    //     },
    //   });
    // }
    // this.notificationWsClient.sendNotification(
    //   this.req.user.companyCode,
    //   pendingNotification,
    // );

    return transactionResult;
  }

  async approveRequest(datas: UpdateApprovalStatusDTO[]) {
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

      if (!updatedData) {
        throw new NotFound(
          'AssignmentApproval data doesnt exist or not Need Approval',
        );
      }

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
        this.approve(updatedData);
      } else {
        this.reject(updatedData);
      }
    }
  }

  async approve(updatedData: IAssignmentApproval) {
    if (updatedData.type == 'And') {
      const remainApproval = await this.assignmentApprovalModel.find({
        request: updatedData.request,
        level: updatedData.level,
        status: 'Need Approval',
      });

      if (remainApproval.length != 0) {
        return;
      }
    }

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
    await this.assignmentApprovalModel.updateMany(
      {
        request: updatedData.request,
        level: updatedData.level + 1,
      },
      {
        status: 'Need Approval',
      },
    );

    const nextLevelApprovalData = await this.assignmentApprovalModel.find({
      request: updatedData.request,
      level: updatedData.level + 1,
      status: 'Need Approval',
    });

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

    if (nextLevelApprovalData.length > 0) {
      return;
    }

    await this.requestModel.findByIdAndUpdate(updatedData.request, {
      status: 'Approved',
    });

    await this.updateTransactionStatus(updatedData.transaction);
  }

  async reject(updatedData: IAssignmentApproval) {
    if (updatedData.type == 'Or') {
      const remainApproval = await this.assignmentApprovalModel.find({
        request: updatedData.request,
        level: updatedData.level,
        status: 'Need Approval',
      });

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

    await this.updateTransactionStatus(updatedData.transaction);

    // const transactionData = await this.transactionModel.findById(
    //   updatedData.transaction,
    // );

    // let pendingNotification: CreateNotificationDTO[];

    // pendingNotification.push({
    //   user: transactionData.manager._id.toString(),
    //   title: 'Assigment Request Rejected',
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

  async reportMissingRequest(requestId: string, notes?: string) {
    let userFullName;
    let newStatus = 'Report Missing';

    const userId = this.req.user.id;

    const requestData: IAssignmentRequest =
      await this.requestModel.findById(requestId);

    if (!requestData) {
      throw new NotFound('request data could not be found');
    }

    const transactionData: IAssignmentTransaction =
      await this.transactionModel.findById(requestData.transaction);

    if (userId == transactionData.assignedTo._id) {
      userFullName = transactionData.assignedTo.fullName;
      newStatus = newStatus + ' by User';
    } else {
      const manager: IUserTransactionRole = await isManager(
        this.groupModel,
        this.userTransactionRoleModel,
        transactionData.group._id,
        userId,
        'borrowingRole',
        ['Manager'],
      );

      if (!manager) {
        throw new Unauthorized('You are not a borrowing manager');
      }
      userFullName = manager.user.fullName;
    }
    const result = await this.requestModel.findByIdAndUpdate(
      requestId,
      {
        status: newStatus,
      },
      { new: true },
    );

    await this.transactionLogModel.create({
      type: 'Assignment',
      transactionId: transactionData.transactionId,
      transaction: requestData._id,
      action: 'Report Missing',
      userId: new Types.ObjectId(userId),
      userFullName: userFullName,
      detail: { notes: notes },
    });

    await this.userAssignmentLogModel.create({
      transactionId: transactionData.transactionId,
      assetName: requestData.assetName.nameWithSequence,
      action: 'Report Missing',
      userId: transactionData.assignedTo._id,
      userFullName: userFullName,
    });

    const trackingManagers: IUserTransactionRole[] =
      await this.getManagersPerRole(transactionData.group._id, 'trackingRole');

    let pendingNotification: CreateNotificationDTO[];
    for (const manager of trackingManagers) {
      pendingNotification.push({
        user: manager.user._id.toString(),
        title: 'Asset ' + newStatus,
        detail: transactionData.transactionId,
        isReadOnly: true,
        isManager: true,
        severity: 'danger',
        data: {
          transaction: result.transaction,
          request: result._id,
        },
      });
    }
    this.notificationWsClient.sendNotification(
      this.req.user.companyCode,
      pendingNotification,
    );

    return result;
  }

  async unassignRequest(requestIds: string[]) {
    for (const requestId of requestIds) {
      const userId = this.req.user.id;
      const requestData: IAssignmentRequest =
        await this.requestModel.findById(requestId);

      if (!requestData) {
        throw new NotFound('request data not found');
      }
      if (requestData.status != 'Assigned') {
        throw new Forbidden('request data is not assigned / handed over');
      }

      const transactionData = await this.transactionModel.findById(
        requestData.transaction,
      );

      const manager: IUserTransactionRole = await isManager(
        this.groupModel,
        this.userTransactionRoleModel,
        transactionData.group._id,
        userId,
        'borrowingRole',
        ['Manager'],
      );

      if (!manager) {
        throw new Unauthorized('You are not a borrowing manager');
      }

      await this.requestModel.findByIdAndUpdate(requestId, {
        status: 'Unassigned',
      });

      await this.transactionLogModel.create({
        type: 'Assignment',
        transactionId: transactionData.transactionId,
        transaction: requestData._id,
        action: 'Unassigned',
        userId: new Types.ObjectId(userId),
        userFullName: manager.user.fullName,
      });

      // let pendingNotification: CreateNotificationDTO[];

      // const managers: IUserTransactionRole[] = await this.getManagersPerRole(
      //   transactionData.group._id,
      //   'borrowingRole',
      // );
      // for (const manager of managers) {
      //   pendingNotification.push({
      //     user: manager.user._id.toString(),
      //     title: 'Asset has been Unassigned',
      //     detail: transactionData.transactionId,
      //     isReadOnly: true,
      //     isManager: true,
      //     severity: 'success',
      //     data: {
      //       transaction: requestData.transaction,
      //       request: requestData._id,
      //     },
      //   });
      // }
      // this.notificationWsClient.sendNotification(
      //   this.req.user.companyCode,
      //   pendingNotification,
      // );

      await this.updateAssignedTransactionStatus(requestData.transaction);
    }
  }

  async reportDamagedRequest(requestId: string, image: any, notes?: string) {
    let userFullName;
    let newStatus = 'Report Damaged';

    const userId = this.req.user.id;

    const requestData: IAssignmentRequest =
      await this.requestModel.findById(requestId);

    if (!requestData) {
      throw new NotFound('request data could not be found');
    }

    const transactionData: IAssignmentTransaction =
      await this.transactionModel.findById(requestData.transaction);

    if (userId == transactionData.assignedTo._id) {
      userFullName = transactionData.assignedTo.fullName;
      newStatus = newStatus + ' by User';
    } else {
      const manager: IUserTransactionRole = await isManager(
        this.groupModel,
        this.userTransactionRoleModel,
        transactionData.group._id,
        userId,
        'borrowingRole',
        ['Manager'],
      );

      if (!manager) {
        throw new Unauthorized('You are not a borrowing manager');
      }
      userFullName = manager.user.fullName;

      await this.fileDamageModel.create({
        assetImageSmall: image?.small,
        assetImageMedium: image?.medium,
        assetImageBig: image?.big,
        assetName: requestData.assetName.nameWithSequence,
        group: transactionData.group,
        modifiedBy: manager.user,
      });
    }

    const result = await this.requestModel.findByIdAndUpdate(requestId, {
      status: newStatus,
    });

    await this.transactionLogModel.create({
      type: 'Assignment',
      transactionId: transactionData.transactionId,
      transaction: requestData._id,
      action: 'Report Damaged',
      userId: new Types.ObjectId(userId),
      userFullName: userFullName,
      detail: { notes: notes },
    });

    await this.userAssignmentLogModel.create({
      transactionId: transactionData.transactionId,
      assetName: requestData.assetName.nameWithSequence,
      action: 'Report Damaged',
      userId: transactionData.assignedTo._id,
      userFullName: userFullName,
    });

    // const maintenanceManagers: IUserTransactionRole[] =
    //   await this.getManagersPerRole(
    //     transactionData.group._id,
    //     'maintenanceRole',
    //   );

    // let pendingNotification: CreateNotificationDTO[];
    // for (const manager of maintenanceManagers) {
    //   pendingNotification.push({
    //     user: manager.user._id.toString(),
    //     title: 'Asset ' + newStatus,
    //     detail: transactionData.transactionId,
    //     isReadOnly: true,
    //     isManager: true,
    //     severity: 'danger',
    //     data: {
    //       transaction: result.transaction,
    //       request: result._id,
    //     },
    //   });
    // }
    // this.notificationWsClient.sendNotification(
    //   this.req.user.companyCode,
    //   pendingNotification,
    // );

    return result;
  }

  async getManagersPerRole(groupId: string | Types.ObjectId, role: string) {
    return await this.userTransactionRoleModel.find({
      'group._id': new Types.ObjectId(groupId),
      transactionGroupAttribute: role,
      roleType: 'Manager',
      isActive: true,
    });
  }

  async getTransactionLogList(requestId: string | Types.ObjectId) {
    return await this.transactionLogModel.find({
      transaction: new Types.ObjectId(requestId),
    });
  }

  async updateTransactionStatus(transactionId: string | Types.ObjectId) {
    const relatedRequests: IAssignmentRequest[] = await this.requestModel.find({
      transaction: new Types.ObjectId(transactionId),
    });

    const rejectedRequest = relatedRequests.filter(
      (request) => request.status == 'Rejected',
    );
    const cancelledRequest = relatedRequests.filter(
      (request) => request.status == 'Cancelled',
    );
    const approvedRequest = relatedRequests.filter(
      (request) => request.status == 'Approved',
    );

    const waitingForHandoverRequest = relatedRequests.filter(
      (request) => request.status == 'Waiting for Handover',
    );

    const totalFinishedRequest =
      rejectedRequest.length +
      cancelledRequest.length +
      approvedRequest.length +
      waitingForHandoverRequest.length;

    if (totalFinishedRequest < relatedRequests.length) {
      return;
    }

    if (cancelledRequest.length == relatedRequests.length) {
      this.transactionModel.findByIdAndUpdate(transactionId, {
        status: 'Cancelled',
      });
    } else if (rejectedRequest.length == relatedRequests.length) {
      this.transactionModel.findByIdAndUpdate(transactionId, {
        status: 'Rejected',
      });
    } else {
      this.requestModel.updateMany(
        {
          transaction: new Types.ObjectId(transactionId),
          status: 'Approved',
        },
        {
          status: 'Waiting for Handover',
        },
      );

      const transaction: IAssignmentTransaction =
        await this.transactionModel.findByIdAndUpdate(transactionId, {
          status: 'Waiting for Handover',
        });

      console.log(transaction);
      // let pendingNotification: CreateNotificationDTO[];

      // const managers: IUserTransactionRole[] = await this.getManagersPerRole(
      //   transaction.group._id,
      //   'borrowingRole',
      // );
      // for (const manager of managers) {
      //   pendingNotification.push({
      //     user: manager.user._id.toString(),
      //     title: 'Waiting for Asset Handover',
      //     detail: transaction.transactionId,
      //     isReadOnly: true,
      //     isManager: true,
      //     severity: 'warning',
      //     data: {
      //       transaction: transaction._id,
      //     },
      //   });
      // }
      // this.notificationWsClient.sendNotification(
      //   this.req.user.companyCode,
      //   pendingNotification,
      // );
    }
  }

  async updateAssignedTransactionStatus(
    transactionId: string | Types.ObjectId,
  ) {
    const relatedRequests = await this.requestModel.find({
      transaction: new Types.ObjectId(transactionId),
    });

    const unassignedRequests = relatedRequests.filter((request) => {
      request.status == 'Unassigned';
    });

    if (relatedRequests.length == unassignedRequests.length) {
      await this.transactionModel.findByIdAndUpdate(transactionId, {
        status: 'Unassigned',
      });
    }
  }
}
