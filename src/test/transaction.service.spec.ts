import { Test, TestingModule } from '@nestjs/testing';
import { MongooseConfigService } from '../db/db.config';
import { Request } from 'express';
import * as mongoose from 'mongoose';
import { ContextIdFactory, REQUEST } from '@nestjs/core';
import {
  IAssignmentApproval,
  IAssignmentRequest,
  IAssignmentTransaction,
  ITransactionLog,
  IUserTransactionRole,
} from 'schemas';
import { Model } from 'mongoose';
import { TransactionService } from '../services/transaction.service';
import { NotificationWebsocketService } from '../services/notification.websocket.service';

describe('transaction service', () => {
  let transactionService: TransactionService;
  let mongooseConfigService: MongooseConfigService;
  let module: TestingModule;

  const mockRequest: Request = {
    user: {
      companyCode: 'testCompany',
    },
  } as Request;

  const mockModel = {
    find: jest.fn(),
    insertMany: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn().mockReturnThis(),
    select: jest.fn(),
    updateMany: jest.fn(),
    create: jest.fn(),
    findOne: jest.fn(),
  };

  const mockRequestModel = {
    find: jest.fn(),
    insertMany: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn().mockReturnThis(),
    select: jest.fn(),
    updateMany: jest.fn(),
    create: jest.fn(),
  };

  const mockTransactionModel = {
    find: jest.fn(),
    findOne: jest.fn().mockReturnThis(),
    sort: jest.fn(),
    insertMany: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn().mockReturnThis(),
    select: jest.fn(),
    updateMany: jest.fn(),
    create: jest.fn(),
  };

  const mockApprovalModel = {
    find: jest.fn(),
    insertMany: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn().mockReturnThis(),
    select: jest.fn(),
    updateMany: jest.fn(),
    create: jest.fn(),
  };

  const mockTransactionLogModel = {
    find: jest.fn(),
    insertMany: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn().mockReturnThis(),
    select: jest.fn(),
    updateMany: jest.fn(),
    create: jest.fn(),
  };

  const mockService = {
    sendNotification: jest.fn(),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        TransactionService,
        {
          provide: NotificationWebsocketService,
          useValue: mockService,
        },
        {
          provide: MongooseConfigService,
          useValue: {
            getModel: jest.fn().mockResolvedValue(mockModel),
          },
        },
        {
          provide: REQUEST,
          useValue: mockRequest,
        },
      ],
    }).compile();

    const contextId = ContextIdFactory.create();
    jest
      .spyOn(ContextIdFactory, 'getByRequest')
      .mockImplementation(() => contextId);

    transactionService =
      await module.resolve<TransactionService>(TransactionService);

    mongooseConfigService = module.get<MongooseConfigService>(
      MongooseConfigService,
    );

    jest
      .spyOn(mongooseConfigService, 'getModel')
      .mockResolvedValueOnce(
        mockTransactionModel as unknown as Model<IAssignmentTransaction>,
      );
    jest
      .spyOn(mongooseConfigService, 'getModel')
      .mockResolvedValueOnce(
        mockRequestModel as unknown as Model<IAssignmentRequest>,
      );
    jest
      .spyOn(mongooseConfigService, 'getModel')
      .mockResolvedValueOnce(
        mockModel as unknown as Model<IUserTransactionRole>,
      );
    jest
      .spyOn(mongooseConfigService, 'getModel')
      .mockResolvedValueOnce(
        mockApprovalModel as unknown as Model<IAssignmentApproval>,
      );
    jest
      .spyOn(mongooseConfigService, 'getModel')
      .mockResolvedValueOnce(
        mockTransactionLogModel as unknown as Model<ITransactionLog>,
      );

    await transactionService.setConnection();
  });

  afterAll(async () => {
    for (const connection of mongoose.connections) {
      await connection.close();
    }
  });

  it('should be defined', () => {
    expect(transactionService).toBeDefined();
  });

  it('should set connection', async () => {
    await transactionService.setConnection();
    expect(transactionService['transactionModel']).toBeDefined();
  });

  describe('cancelRequest', () => {
    it('should be success', async () => {
      jest
        .spyOn(transactionService, 'updateTransactionStatus')
        .mockResolvedValue();

      jest
        .spyOn(transactionService, 'isManager')
        .mockResolvedValue({ user: { _id: '', fullName: '', key: 2 } });
      mockRequestModel.findById.mockResolvedValue({ transaction: '' });
      mockTransactionModel.findById.mockResolvedValue({
        group: { _id: '' },
        transactionId: '',
      });
      mockRequestModel.select.mockResolvedValue({
        transaction: '',
        assetName: { nameWithSequence: '' },
      });

      await transactionService.cancelRequest([
        '65ea6fc61f39f83ef63583ec',
        '65ea6fc61f39f83ef63583ec',
      ]);
      expect(mockTransactionLogModel.create).toHaveBeenCalledTimes(2);
    });
  });

  describe('cancelTransaction', () => {
    it('should be success', async () => {
      mockTransactionModel.findById.mockResolvedValueOnce({
        group: { _id: '' },
      });
      jest
        .spyOn(transactionService, 'isManager')
        .mockResolvedValue({ user: { _id: '', fullName: '', key: 2 } });

      mockRequestModel.find.mockResolvedValueOnce([
        { transaction: '', asset: '', assetName: { nameWithSequence: '' } },
        { transaction: '', asset: '', assetName: { nameWithSequence: '' } },
      ]);

      await transactionService.cancelTransaction('65ea6fc61f39f83ef63583ec');
    });
  });

  describe('handoverTransaction', () => {
    it('should be success', async () => {
      mockTransactionModel.findById.mockResolvedValueOnce({
        confirmationEmailConfirmed: true,
        status: 'Waiting for Handover',
        group: {
          _id: '',
        },
      });

      jest
        .spyOn(transactionService, 'isManager')
        .mockResolvedValue({ user: { _id: '', fullName: '', key: 2 } });

      mockTransactionModel.select.mockResolvedValueOnce({ transactionId: '' });

      mockRequestModel.find.mockResolvedValueOnce([
        {
          _id: '',
          asset: '',
          assetName: {
            nameWithSequence: '',
          },
        },
      ]);

      await transactionService.handoverTransaction('65ea7d29f5cd331b5beed2b1');
    });
  });

  describe('reportMissingRequest', () => {
    it('should be success', async () => {
      mockRequestModel.findById.mockResolvedValueOnce({
        transaction: '',
        _id: '',
      });

      mockTransactionModel.findById.mockResolvedValueOnce({
        assignedTo: {
          _id: '',
          fullName: '',
        },
        group: {
          _id: '',
        },
        transactionId: '',
      });

      jest
        .spyOn(transactionService, 'isManager')
        .mockResolvedValue({ user: { _id: '', fullName: '', key: 2 } });

      await transactionService.reportMissingRequest('', '');
    });
  });

  describe('unassignRequest', () => {
    it('should be success', async () => {
      mockRequestModel.findById.mockResolvedValue({
        transaction: '',
        status: 'Assigned',
        _id: '',
      });

      mockTransactionModel.findById.mockResolvedValue({
        group: {
          _id: '',
        },
        transactionId: '',
      });

      jest
        .spyOn(transactionService, 'isManager')
        .mockResolvedValue({ user: { _id: '', fullName: '', key: 2 } });

      jest
        .spyOn(transactionService, 'updateAssignedTransactionStatus')
        .mockResolvedValue();

      await transactionService.unassignRequest(['']);
    });
  });

  describe('generateTransactionId', () => {
    it('should be success', async () => {
      await transactionService.generateTransactionId();
    });
  });

  describe('createTransaction', () => {
    it('should be success', async () => {
      jest
        .spyOn(transactionService, 'generateTransactionId')
        .mockResolvedValue('');

      mockRequestModel.create.mockResolvedValue({
        _id: '',
      });

      mockTransactionModel.create.mockResolvedValue({
        _id: '',
        manager: {
          _id: '',
          fullName: '',
        },
        group: {
          _id: '65ea6fc61f39f83ef63583ed',
        },
      });

      jest.spyOn(transactionService, 'createApproval').mockResolvedValue();

      jest
        .spyOn(transactionService, 'updateTransactionStatus')
        .mockResolvedValue();

      await transactionService.createTransaction([
        {
          asset: '65ea7d29f5cd331b5beed2b1',
          assetGroup: { _id: '65ea6fc61f39f83ef63583ed', name: 'A', key: 1 },
          assetName: {
            _id: '65ea6fc61f39f83ef63583ed',
            nameWithSequence: 'Grup b',
            key: 1,
          },
          assetBrand: { _id: '65ea6fc61f39f83ef63583ed', name: 'A', key: 1 },
          assetModel: { _id: '65ea6fc61f39f83ef63583ed', name: 'A', key: 1 },
          user: { _id: '65ea6fc61f39f83ef63583ed', fullName: 'A', key: 1 },
        },
      ]);
    });
  });
  describe('getTransactionLogList', () => {
    it('should be success', async () => {
      await transactionService.getTransactionLogList(
        '6600ed5574ca4757a84d7543',
      );

      expect(mockTransactionLogModel.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('createApproval', () => {
    it('should be success', async () => {
      mockModel.find.mockResolvedValueOnce([
        {
          approvalLevel: 1,
          user: {
            _id: '',
          },
          approvalType: 'and',
        },
      ]);

      await transactionService.createApproval(
        {
          transactionId: '',
          key: 0,
          manager: {
            _id: '',
            fullName: '',
            key: 0,
          },
          group: {
            _id: '65ea7d29f5cd331b5beed2b1',
            name: '',
            key: 0,
          },
          assignedTo: {
            _id: '',
            fullName: '',
            key: 0,
          },
        },
        {},
      );
    });
  });

  describe('approve', () => {
    it('should be success', async () => {
      mockApprovalModel.find.mockResolvedValueOnce([{}, {}]);

      mockApprovalModel.find.mockResolvedValueOnce([]);

      await transactionService.approve({
        type: 'And',
        request: '',
        level: 2,
      });
    });
  });

  describe('reject', () => {
    it('should be success', async () => {
      mockApprovalModel.find.mockResolvedValueOnce([{}, {}]);

      jest
        .spyOn(transactionService, 'updateTransactionStatus')
        .mockResolvedValue();

      await transactionService.reject({
        type: 'Or',
        request: '',
        level: 1,
        transaction: '',
      });
    });
  });

  describe('isManager', () => {
    it('should be success', async () => {
      await transactionService.isManager(
        '65ea7d29f5cd331b5beed2b1',
        '65ea7d29f5cd331b5beed2b1',
      );
    });
  });

  describe('getManagersPerRole', () => {
    it('should be success', async () => {
      await transactionService.getManagersPerRole(
        '65ea7d29f5cd331b5beed2b1',
        '',
      );
    });
  });

  describe('updateTransactionStatus', () => {
    it('should be success', async () => {
      mockRequestModel.find.mockResolvedValueOnce([
        { status: 'Rejected' },
        { status: 'Cancelled' },
        { status: 'Approved' },
        { status: 'Waiting for Handover' },
      ]);

      await transactionService.updateTransactionStatus(
        '65ea7d29f5cd331b5beed2b1',
      );
    });
  });
  describe('updateAssignedTransactionStatus', () => {
    it('should be success', async () => {
      mockRequestModel.find.mockResolvedValueOnce([{ status: 'Unassigned' }]);

      await transactionService.updateAssignedTransactionStatus(
        '65ea7d29f5cd331b5beed2b1',
      );
    });
  });
});
