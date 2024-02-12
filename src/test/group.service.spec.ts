import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { GroupService } from '../services/group.service';
import { CreateGroupDTO } from '../dto/group.dto';

describe('GroupService', () => {
  let service: GroupService;

  const MockModel = {
    aggregate: jest.fn().mockReturnThis(),
    findOne: jest.fn().mockReturnThis(),
    find: jest.fn().mockReturnThis(),
    findByIdAndUpdate: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    exec: jest.fn(),
    create: jest.fn(),
    updateOne: jest.fn(),
    sort: jest.fn(),
  };

  const title = 'should have correct output';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupService,

        {
          provide: getModelToken('groups'),
          useValue: MockModel,
        },
      ],
    }).compile();

    service = module.get<GroupService>(GroupService);
  });

  describe('aggregateGroup', () => {
    it(title, async () => {
      const modelSpy = jest.spyOn(MockModel, 'aggregate');
      modelSpy.mockResolvedValueOnce([
        {
          _id: 'mockId',
          name: 'mockName',
        },
      ]);

      await service.aggregateGroups([{ $match: {} }]);

      expect(modelSpy).toHaveBeenCalled();
    });
  });

  describe('createGroup', () => {
    it(title, async () => {
      const dto: CreateGroupDTO = {
        name: 'A',
        quota: 1,
      };

      const modelSpy = jest.spyOn(MockModel, 'create');
      modelSpy.mockResolvedValueOnce({
        _id: 'mockId',
        name: 'mockName',
      });

      const result = await service.createGroup(dto);

      expect(modelSpy).toHaveBeenCalled();
      expect(result).toEqual(
        expect.objectContaining({
          _id: expect.any(String),
          name: expect.any(String),
        }),
      );
    });
  });
});
