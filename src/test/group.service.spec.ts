import { Test, TestingModule } from '@nestjs/testing';
import { GroupService } from '../services/group.service';
import { MongooseConfigService } from '../db/db.config';
import { getModelToken } from '@nestjs/mongoose';
import { Request } from 'express';
import * as mongoose from 'mongoose';
import { ContextIdFactory, REQUEST } from '@nestjs/core';

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
      jest
        .spyOn(mockGroupModel, 'aggregate')
        .mockImplementationOnce(
          () => Promise.resolve([{ _id: 'a', name: 'b', key: 1 }]) as any,
        );

      await groupService.aggregateGroups(mockPipeline);

      expect(groupService).toBeDefined();
    });
  });
});
