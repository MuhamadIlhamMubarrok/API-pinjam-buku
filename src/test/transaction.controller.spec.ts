import { TransactionController } from '../controllers/transaction.controller';
import * as mongoose from 'mongoose';
import { REQUEST } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { Request, Response } from 'express';
import { MongooseConfigService } from '../db/db.config';
import { TransactionService } from '../services/transaction.service';

describe('Transaction Controller', () => {
  let transactionController: TransactionController;

  const mockJson = jest.fn();

  const mockRes = {
    status: jest.fn().mockReturnThis(),
    json: mockJson,
    send: jest.fn(),
  } as unknown as Response;

  const mockRequest: Request = {
    user: {
      companyCode: 'testCompany',
    },
  } as Request;

  const mockService = {
    cancelRequest: jest.fn(),
    cancelTransaction: jest.fn(),
    handoverTransaction: jest.fn(),
    reportMissingRequest: jest.fn(),
    reportDamagedRequest: jest.fn(),
    unassignRequest: jest.fn(),
    createTransaction: jest.fn(),
    getTransactionLogList: jest.fn(),
  };

  beforeEach(async () => {
    mockJson.mockClear();

    const module = await Test.createTestingModule({
      controllers: [TransactionController],
      providers: [
        {
          provide: TransactionService,
          useValue: mockService,
        },
        {
          provide: REQUEST,
          useValue: mockRequest,
        },
        MongooseConfigService,
      ],
    }).compile();

    transactionController = module.get<TransactionController>(
      TransactionController,
    );
  });

  afterAll(async () => {
    for (const connection of mongoose.connections) {
      connection.close();
    }
  });

  describe('unit testing for => cancelRequest', () => {
    it('should have success', async () => {
      mockService.cancelRequest.mockResolvedValueOnce({});

      await transactionController.cancelRequest(mockRes, { id: [''] });

      expect(mockService.cancelRequest).toHaveBeenCalledTimes(1);
    });
  });

  describe('unit testing for => cancelTransaction', () => {
    it('should have success', async () => {
      mockService.cancelTransaction.mockResolvedValueOnce({});

      await transactionController.cancelTransaction(mockRes, '');

      expect(mockService.cancelTransaction).toHaveBeenCalledTimes(1);
    });
  });

  describe('unit testing for => handoverTransaction', () => {
    it('should be success', async () => {
      mockService.handoverTransaction.mockResolvedValueOnce({});

      await transactionController.handoverTransaction(mockRes, '');

      expect(mockService.handoverTransaction).toHaveBeenCalledTimes(1);
    });
  });

  describe('unit testing for => reportMissingRequest', () => {
    it('should be success', async () => {
      await transactionController.reportMissingRequest(mockRes, '', {
        note: '',
      });

      expect(mockService.reportMissingRequest).toHaveBeenCalledTimes(1);
    });
  });

  describe('unit testing for => unassignRequest', () => {
    it('should be success', async () => {
      mockService.unassignRequest.mockResolvedValueOnce({});

      await transactionController.unassignRequest(mockRes, { id: [''] });

      expect(mockService.unassignRequest).toHaveBeenCalledTimes(1);
    });
  });

  describe('unit testing for => createTransaction', () => {
    it('should be success', async () => {
      await transactionController.createTransaction(mockRes, []);

      expect(mockService.createTransaction).toHaveBeenCalledTimes(1);
    });
  });

  describe('unit testing for => getTransactionLogList', () => {
    it('should be success', async () => {
      await transactionController.getTransactionLogList(mockRes, '');

      expect(mockService.getTransactionLogList).toHaveBeenCalledTimes(1);
    });
  });
});
