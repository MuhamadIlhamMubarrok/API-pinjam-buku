import { Test, TestingModule } from '@nestjs/testing';
import { GroupController } from '../controllers/group.controller';
import { GroupService } from '../services/group.service';
import { getModelToken } from '@nestjs/mongoose';
import { MongooseConfigService } from '../db/db.config';
import { REQUEST } from '@nestjs/core';

describe('Group Controller', () => {
  let controller: GroupController;
  let service: Promise<GroupService>;

  const mockJson = jest.fn();

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

  beforeEach(async () => {
    mockJson.mockClear();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupController],
      providers: [
        GroupService,
        MongooseConfigService,
        { provide: getModelToken('groups'), useValue: MockModel },
        {
          provide: REQUEST,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<GroupController>(GroupController);
    service = module.resolve(GroupService);
  });

  it('should be defined', async () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });
});
