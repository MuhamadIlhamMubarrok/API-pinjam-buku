import { Test, TestingModule } from '@nestjs/testing';
import { GroupService } from '../services/group.service';
import { MongooseConfigService } from '../db/db.config';
import { getModelToken } from '@nestjs/mongoose';
import { Request } from 'express';
import * as mongoose from 'mongoose';
import { ContextIdFactory, REQUEST } from '@nestjs/core';
import { ObjectId } from 'mongodb';
import { CreateGroupDTO } from '../dto/group.dto';

describe('GroupService', () => {
  let groupService: GroupService;
  let module: TestingModule;

  const mockRequest: Request = {
    user: {
      companyCode: 'testCompany',
    },
  } as Request;

  const mockGroupModel = {
    aggregate: jest.fn(),
    findOne: jest.fn().mockReturnThis(),
    create: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        GroupService,
        MongooseConfigService,
        {
          provide: getModelToken('groups'),
          useValue: mockGroupModel,
        },
        {
          provide: REQUEST,
          useValue: mockRequest,
        },
      ],
    })

      .compile();

    const contextId = ContextIdFactory.create();
    jest
      .spyOn(ContextIdFactory, 'getByRequest')
      .mockImplementation(() => contextId);

    groupService = await module.resolve<GroupService>(GroupService, contextId);
  });

  afterAll(async () => {
    for (const connection of mongoose.connections) {
      await connection.close();
    }
  });

  describe('aggregateGroups', () => {
    it('should call aggregate on the groupModel', async () => {
      const mockPipeline = [{ $match: {} }];
      mockGroupModel.aggregate.mockImplementationOnce(() => [{}]);

      await mockGroupModel.aggregate(mockPipeline);
      await groupService.aggregateGroups(mockPipeline);

      expect(groupService).toBeDefined();
      expect(mockGroupModel.aggregate).toHaveBeenCalled();
    });
  });

  describe('generate key', () => {
    it('Should return correctly', async () => {
      mockGroupModel.findOne().sort.mockResolvedValueOnce({
        name: 'A',
        quota: 1,
        parent: new ObjectId(),
      });

      await mockGroupModel.findOne().sort();
      const result = await groupService.generateKey();

      expect(mockGroupModel.findOne().sort).toHaveBeenCalled();
      expect(result).toEqual(expect.any(Number));
    });
  });

  describe('create Group', () => {
    it('Should return a correct output', async () => {
      mockGroupModel.create.mockResolvedValueOnce({
        name: 'A',
        quota: 1,
        parent: new ObjectId(),
      });

      await mockGroupModel.create();
      const mockDto: CreateGroupDTO = {
        name: 'A',
        quota: 0,
      };
      const result = await groupService.createGroup(mockDto);

      expect(mockGroupModel.findOne().sort).toHaveBeenCalled();
      expect(result).toEqual(expect.any(Object));
    });
  });
});
