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

  describe('unit testing for => cancelRequest', () => {
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

  describe('unit testing for => cancelTransaction', () => {
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
});
