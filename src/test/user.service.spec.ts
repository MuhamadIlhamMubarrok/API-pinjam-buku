import { Test, TestingModule } from '@nestjs/testing';
import { MongooseConfigService } from '../db/db.config';
import { UserService } from '../services/user.service';

describe('UserService', () => {
  let service: UserService;

  const model = {
    create: jest.fn(),
    findOne: jest.fn(),
    getOneUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
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

    service = await module.resolve<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should set connection', async () => {
    await service.setConnection();
    expect(service['userModel']).toBeDefined();
  });

  it('should get one user', async () => {
    const filter = { name: 'test' };
    model.findOne.mockResolvedValue({ name: 'test' });
    const user = await service.getOneUser(filter);
    expect(user).toEqual({ name: 'test' });
    expect(model.findOne).toHaveBeenCalledWith(filter);
  });
});
