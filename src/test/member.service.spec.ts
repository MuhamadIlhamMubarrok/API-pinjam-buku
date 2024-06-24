import { Test, TestingModule } from '@nestjs/testing';
import { MongooseConfigService } from '../db/db.config';
import { MemberService } from '../services/member.service';

describe('MemberService', () => {
  let service: MemberService;

  const model = {
    create: jest.fn(),
    findOne: jest.fn(),
    aggregate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MemberService,
        {
          provide: MongooseConfigService,
          useValue: {
            getModel: jest.fn().mockResolvedValue(model),
          },
        },
        {
          provide: 'REQUEST',
          useValue: {
            member: {
              companyCode: 'test',
            },
          },
        },
      ],
    }).compile();

    service = await module.resolve<MemberService>(MemberService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should set connection', async () => {
    await service.setConnection();
    expect(service['memberModel']).toBeDefined();
  });

  it('aggregateMember', async () => {
    model.aggregate.mockResolvedValue({});
    await service.aggregateMember([]);

    expect(model.aggregate).toHaveBeenCalled();
  });

  it('createMember', async () => {
    const mockBody = {
      name: 'ilham',
    };
    model.create.mockResolvedValue({});
    await service.createMember(mockBody);

    expect(model.aggregate).toHaveBeenCalled();
  });
});
