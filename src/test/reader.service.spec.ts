import { Test, TestingModule } from '@nestjs/testing';
import { MongooseConfigService } from 'src/db/db.config';
import { ReaderService } from 'src/services/reader.service';
import { Request } from 'express';
import * as mongoose from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { ContextIdFactory, REQUEST } from '@nestjs/core';
import { IReader } from 'schemas';
import { Model } from 'mongoose';

describe('reader service', () => {
  let readerService: ReaderService;
  let mongooseConfigService: MongooseConfigService;
  let module: TestingModule;

  const mockRequest: Request = {
    user: {
      companyCode: 'testCompany',
    },
  } as Request;

  const mockReaderModel = {
    aggregate: jest.fn(),
    findOne: jest.fn().mockReturnThis(),
    create: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        ReaderService,
        MongooseConfigService,
        {
          provide: getModelToken('readers'),
          useValue: mockReaderModel,
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

    readerService = await module.resolve<ReaderService>(ReaderService);

    mongooseConfigService = module.get<MongooseConfigService>(
      MongooseConfigService,
    );

    jest
      .spyOn(mongooseConfigService, 'getModel')
      .mockResolvedValueOnce(mockReaderModel as unknown as Model<IReader>);

    await readerService.setConnection();
  });

  afterAll(async () => {
    for (const connection of mongoose.connections) {
      await connection.close();
    }
  });
});
