import { PrelistService } from '../services/prelist.service';
import { Test, TestingModule } from '@nestjs/testing';
import { MongooseConfigService } from '../db/db.config';
import { Request } from 'express';
import * as mongoose from 'mongoose';
import { REQUEST } from '@nestjs/core';
import {
  IAsset,
  IAssignmentPrelist,
  IAssignmentPrelistRequest,
  IUser,
} from 'schemas';
import { Model } from 'mongoose';

describe('prelist service', () => {
  let prelistService: PrelistService;
  let mongooseConfigService: MongooseConfigService;
  let module: TestingModule;

  const mockRequest: Request = {
    user: {
      companyCode: 'testCompany',
    },
  } as Request;

  const mockPrelistModel = {
    aggregate: jest.fn(),
    create: jest.fn(),
    deleteMany: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  };
  const mockPrelistRequestModel = {
    aggregate: jest.fn(),
    create: jest.fn(),
    insertMany: jest.fn(),
    deleteMany: jest.fn(),
  };
  const mockAssetModel = {
    findById: jest.fn(),
    aggregate: jest.fn(),
  };
  const mockUserModel = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        PrelistService,
        {
          provide: MongooseConfigService,
          useValue: {
            getModel: jest.fn().mockResolvedValue(mockPrelistModel),
          },
        },
        {
          provide: REQUEST,
          useValue: mockRequest,
        },
      ],
    }).compile();

    prelistService = await module.resolve<PrelistService>(PrelistService);
    mongooseConfigService = module.get<MongooseConfigService>(
      MongooseConfigService,
    );

    jest
      .spyOn(mongooseConfigService, 'getModel')
      .mockResolvedValueOnce(
        mockPrelistModel as unknown as Model<IAssignmentPrelist>,
      );

    jest
      .spyOn(mongooseConfigService, 'getModel')
      .mockResolvedValueOnce(
        mockPrelistRequestModel as unknown as Model<IAssignmentPrelistRequest>,
      );

    jest
      .spyOn(mongooseConfigService, 'getModel')
      .mockResolvedValueOnce(mockAssetModel as unknown as Model<IAsset>);

    jest
      .spyOn(mongooseConfigService, 'getModel')
      .mockResolvedValueOnce(mockUserModel as unknown as Model<IUser>);

    await prelistService.setConnection();
  });

  afterAll(async () => {
    for (const connection of mongoose.connections) {
      await connection.close();
    }
  });

  it('should be defined', () => {
    expect(prelistService).toBeDefined();
  });

  it('should set connection', async () => {
    await prelistService.setConnection();
    expect(prelistService['prelistModel']).toBeDefined();
  });

  describe('aggregatePrelist', () => {
    it('should be success', async () => {
      await prelistService.aggregatePrelist([{ $match: {} }]);

      expect(mockPrelistModel.aggregate).toHaveBeenCalled();
    });
  });

  describe('aggregatePrelistRequest', () => {
    it('should be success', async () => {
      await prelistService.aggregatePrelistRequest([{ $match: {} }]);

      expect(mockPrelistRequestModel.aggregate).toHaveBeenCalled();
    });
  });

  describe('createPrelist', () => {
    it('should be success', async () => {
      mockUserModel.findById.mockResolvedValue({
        _id: '',
        firstName: '',
        lastName: '',
        ket: 2,
      });

      mockAssetModel.aggregate.mockResolvedValueOnce([
        {
          _id: '',
          data: [{}],
        },
      ]);

      mockPrelistModel.create.mockResolvedValueOnce({
        _id: '',
      });

      await prelistService.createPrelist({
        id: ['66027dcf7c9f62aea9237c88'],
        user: '',
      });
    });
  });

  describe('removePrelists', () => {
    it('should be success', async () => {
      await prelistService.removePrelists(['6600ed5574ca4757a84d753d']);

      expect(mockPrelistModel.deleteMany).toHaveBeenCalled();
      expect(mockPrelistRequestModel.deleteMany).toHaveBeenCalled();
    });
  });

  describe('removePrelistReqests', () => {
    it('should be success', async () => {
      mockPrelistRequestModel.deleteMany.mockResolvedValueOnce({
        deleteCount: 1,
      });

      await prelistService.removePrelistReqests('6600ed5574ca4757a84d753d', [
        '6600ed5574ca4757a84d753d',
      ]);

      expect(mockPrelistRequestModel.deleteMany).toHaveBeenCalled();
      expect(mockPrelistModel.findByIdAndUpdate).toHaveBeenCalled();
    });
  });
});
