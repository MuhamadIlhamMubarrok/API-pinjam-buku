import { Test, TestingModule } from '@nestjs/testing';
import { GroupController } from '../controllers/group.controller';
import { GroupService } from '../services/group.service';
import { getModelToken } from '@nestjs/mongoose';
import { MongooseConfigService } from '../db/db.config';
import { ContextIdFactory, REQUEST } from '@nestjs/core';
import * as mongoose from 'mongoose';
import { CreateGroupDTO, GetGroupDTO } from '../dto/group.dto';
import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';

describe('Group Controller', () => {
  let controller: GroupController;

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

  const MockModel = {
    aggregate: jest.fn().mockReturnThis(),
    find: jest.fn().mockReturnThis(),
    findOne: jest.fn().mockReturnThis(),
    findOneAndDelete: jest.fn().mockReturnThis(),
    findByIdAndUpdate: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    exec: jest.fn(),
    create: jest.fn(),
    updateOne: jest.fn(),
    updateMany: jest.fn(),
    sort: jest.fn().mockReturnThis(),
  };

  const MockService = {
    aggregateGroups: jest.fn().mockReturnThis(),
    createGroup: jest.fn().mockReturnThis(),
  };
  beforeEach(async () => {
    mockJson.mockClear();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupController],
      providers: [
        { provide: GroupService, useValue: MockService },
        MongooseConfigService,
        { provide: getModelToken('groups'), useValue: MockModel },
        {
          provide: REQUEST,
          useValue: mockRequest,
        },
      ],
    }).compile();

    controller = module.get<GroupController>(GroupController);

    const contextId = ContextIdFactory.create();
    jest
      .spyOn(ContextIdFactory, 'getByRequest')
      .mockImplementation(() => contextId);
  });

  afterAll(async () => {
    for (const connection of mongoose.connections) {
      await connection.close();
    }
  });

  describe('GET group', () => {
    it('Should have correct output', async () => {
      const resolvedMock = [
        {
          total: 199,
          brandOptions: [],
          groups: [
            {
              _id: 'id1',
              name: 'group1',
              key: 1,
            },
          ],
        },
      ];
      jest
        .spyOn(MockService, 'aggregateGroups')
        .mockResolvedValueOnce(resolvedMock);

      await controller.getGroupList(mockRequest, mockRes, {} as GetGroupDTO);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Successfully get group list',
          status: 200,
          data: expect.objectContaining({
            brandOptions: expect.any(Array),
            groups: expect.arrayContaining([
              expect.objectContaining({
                _id: expect.any(String),
                key: expect.any(Number),
                name: expect.any(String),
              }),
            ]),
            total: expect.any(Number),
          }),
        }),
      );
    });
  });

  describe('POST new Group', () => {
    const mockDTO = new (CreateGroupDTO as jest.Mock<CreateGroupDTO>)();
    it('Should create a new Group and return a correct response', async () => {
      const resolvedMock = {
        _id: new ObjectId(),
        name: 'Mock Group',
        key: 1,
      };

      jest
        .spyOn(MockService, 'createGroup')
        .mockResolvedValueOnce(resolvedMock);

      await controller.createGroup(mockRequest, mockRes, mockDTO);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Successfully created group',
          status: 201,
          data: expect.objectContaining({
            _id: expect.any(ObjectId),
            key: expect.any(Number),
            name: expect.any(String),
          }),
        }),
      );
    });
  });
});
