import { Test, TestingModule } from '@nestjs/testing';
import { ChangelogService } from '../services/changelog.service';
import { MongooseConfigService } from '../db/db.config';
import { UserService } from '../services/user.service';

describe('ChangelogService', () => {
  let service: ChangelogService;

  const model = {
    create: jest.fn(),
    findOne: jest.fn(),
    getOneUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChangelogService,
        UserService,
        {
          provide: MongooseConfigService,
          useValue: {
            getModel: jest.fn().mockResolvedValue(model),
          },
        },
        {
          provide: 'REQUEST',
          useValue: {
            user: {
              companyCode: 'test',
            },
          },
        },
      ],
    }).compile();

    service = await module.resolve<ChangelogService>(ChangelogService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should set connection', async () => {
    await service.setConnection();
    expect(service['changelogModel']).toBeDefined();
  });
});
