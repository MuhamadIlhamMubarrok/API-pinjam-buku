import { Test, TestingModule } from '@nestjs/testing';
<<<<<<< HEAD
import { GroupController } from '../controllers/role.controller';
import { GroupService } from '../services/role.service';
=======
>>>>>>> parent of f638c27 (feat: add request scoped service with connection)
import { getModelToken } from '@nestjs/mongoose';
import { Response, Request } from 'express';
import { ICategory, IDeviceName } from 'schemas';
import * as Util from 'utils';
import { DeviceNameController } from '../controllers/group.controller';
import { DeviceNameService } from '../services/group.service';
import {
  CreateDeviceNameDTO,
  DeleteDeviceNameDto,
  EditDeviceNameDTO,
  GetDeviceNameDTO,
} from '../dto/group.dto';
import { CategoryService } from '../services/category.service';
import { MeasurementService } from '../services/measurement.service';
import { UserService } from '../services/user.service';
import { ChangelogService } from '../services/changelog.service';

describe('Device name Controller', () => {
  let controller: DeviceNameController;
  let service: DeviceNameService;
  let categoryService: CategoryService;

  const MockDeviceNameModel = {
    findOne: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    exec: jest.fn(),
    create: jest.fn(),
  };
  const MockCategoryModel = {
    findOne: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    exec: jest.fn(),
  };
  const MockMeasurementModel = {
    findOne: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    exec: jest.fn(),
  };

  const mockReq = {
    user: {
      id: 'e356aqw12fawr',
    },
  } as unknown as Request;

  const title = 'should have correct output';
  const errorTitle = 'should have correct error response';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeviceNameController],
      providers: [
        DeviceNameService,
        MeasurementService,
        CategoryService,
        UserService,
        ChangelogService,
        {
          provide: getModelToken('device_names'),
          useValue: MockDeviceNameModel,
        },
        {
          provide: getModelToken('categories'),
          useValue: MockCategoryModel,
        },
        {
          provide: getModelToken('measurements'),
          useValue: MockMeasurementModel,
        },
        {
          provide: getModelToken('change_logs'),
          useValue: {},
        },
        {
          provide: getModelToken('user'),
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<DeviceNameController>(DeviceNameController);
    service = module.get<DeviceNameService>(DeviceNameService);
    categoryService = module.get<CategoryService>(CategoryService);
  });

  it('should be defined', async () => {
    expect(controller).toBeDefined();
  });

  describe('GET Device Names', () => {
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    } as unknown as Response;

    it(title, async () => {
      const result: IDeviceName[] = [
        {
          _id: '65693498f56b7c011da9a7d6',
          name: 'abc',
        },
      ];

      jest
        .spyOn(service, 'aggregateDeviceName')
        .mockResolvedValueOnce([{ data: result, totalRecords: 1 }]);

      const mockDto = new (GetDeviceNameDTO as jest.Mock<GetDeviceNameDTO>)();

      await controller.getDeviceNames(mockRes, mockDto);

      expect(mockRes.json).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            data: expect.arrayContaining([
              expect.objectContaining({
                _id: expect.any(String),
                name: expect.any(String),
              }),
            ]),
            totalRecords: expect.any(Number),
          }),
          status: 200,
        }),
      );
    });

    it(errorTitle, async () => {
      const getDeviceNamesSpy = jest
        .spyOn(service, 'aggregateDeviceName')
        .mockRejectedValueOnce(new Util.CustomError(500, 'Mocked error'));

      const errorResponseSpy = jest.spyOn(Util, 'errorResponse');
      errorResponseSpy.mockImplementation();

      const mockDto = new (GetDeviceNameDTO as jest.Mock<GetDeviceNameDTO>)();

      await controller.getDeviceNames(mockRes, mockDto);

      expect(getDeviceNamesSpy).toHaveBeenCalled();
      expect(errorResponseSpy).toHaveBeenCalled();
    });
  });

  describe('POST Device Names', () => {
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    } as unknown as Response;
    it(title, async () => {
      const result: IDeviceName = {
        _id: '65693498f56b7c011da9a7d6',
        name: 'abc',
      };
      const foundCategory: ICategory = {
        _id: 'x',
        name: 'C',
        key: 1,
      };

      jest
        .spyOn(categoryService, 'getOneCategory')
        .mockResolvedValueOnce(foundCategory);
      jest.spyOn(service, 'generateKey').mockResolvedValueOnce(1);
      jest.spyOn(service, 'createDeviceName').mockResolvedValueOnce(result);
      jest.spyOn(service, 'createDeviceNameChangelog').mockResolvedValueOnce();

      const mockDto =
        new (CreateDeviceNameDTO as jest.Mock<CreateDeviceNameDTO>)();
      await controller.createDeviceName(mockReq, mockRes, mockDto);

      expect(mockRes.json).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            _id: expect.any(String),
            name: expect.any(String),
          }),
        }),
      );
    });

    it(errorTitle, async () => {
      const createDeviceNamesSpy = jest
        .spyOn(service, 'createDeviceName')
        .mockRejectedValue(new Util.CustomError(500, 'Mocked error'));

      const errorResponseSpy = jest.spyOn(Util, 'errorResponse');
      errorResponseSpy.mockImplementation();

      const mockDto =
        new (CreateDeviceNameDTO as jest.Mock<CreateDeviceNameDTO>)();
      await controller.createDeviceName(mockReq, mockRes, mockDto);

      expect(createDeviceNamesSpy).toHaveBeenCalled();
      expect(errorResponseSpy).toHaveBeenCalled();
    });
  });

  describe('PUT Device Names', () => {
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    } as unknown as Response;
    it(title, async () => {
      const result: IDeviceName = {
        _id: '65693498f56b7c011da9a7d6',
        name: 'abc',
      };
      const foundCategory: ICategory = {
        name: 'C',
        key: 1,
      };
      const params = { id: 'abc' };

      jest.spyOn(service, 'getOneDeviceName').mockResolvedValueOnce(result);
      jest
        .spyOn(categoryService, 'getOneCategory')
        .mockResolvedValueOnce(foundCategory);
      jest.spyOn(service, 'updateDeviceName').mockResolvedValueOnce(result);
      jest.spyOn(service, 'updateDeviceNameChangelog').mockResolvedValueOnce();

      const mockDto = new (EditDeviceNameDTO as jest.Mock<EditDeviceNameDTO>)();
      await controller.updateDeviceName(mockReq, mockRes, params.id, mockDto);

      expect(service.updateDeviceNameChangelog).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            _id: expect.any(String),
            name: expect.any(String),
          }),
        }),
      );
    });

    it(errorTitle, async () => {
      const params = { id: 'abc' };

      const createDeviceNamesSpy = jest
        .spyOn(service, 'updateDeviceName')
        .mockRejectedValue(new Util.CustomError(500, 'Mocked error'));

      const errorResponseSpy = jest.spyOn(Util, 'errorResponse');
      errorResponseSpy.mockImplementation();

      const mockDto = new (EditDeviceNameDTO as jest.Mock<EditDeviceNameDTO>)();
      await controller.updateDeviceName(mockReq, mockRes, params.id, mockDto);

      expect(createDeviceNamesSpy).toHaveBeenCalled();
      expect(errorResponseSpy).toHaveBeenCalled();
    });
  });

  describe('Delete Device Names', () => {
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    } as unknown as Response;

    it(title, async () => {
      const result = {
        errors: [],
        success: 1,
      };

      jest
        .spyOn(service, 'getDeviceNames')
        .mockResolvedValueOnce([{ name: 'Device_1' }]);
      jest.spyOn(service, 'deleteManyDeviceName').mockResolvedValueOnce(result);
      jest.spyOn(service, 'deleteDeviceNameChangelog').mockResolvedValueOnce();

      const mockDto =
        new (DeleteDeviceNameDto as jest.Mock<DeleteDeviceNameDto>)();
      await controller.deleteDeviceNames(mockReq, mockRes, mockDto);

      expect(service.getDeviceNames).toHaveBeenCalled();
      expect(service.deleteDeviceNameChangelog).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            errors: expect.any(Array),
            success: expect.any(Number),
          }),
          status: expect.any(Number),
        }),
      );
    });

    it(errorTitle, async () => {
      jest
        .spyOn(service, 'getDeviceNames')
        .mockResolvedValueOnce([{ name: 'Device_1' }]);
      const deleteDeviceNamesSpy = jest
        .spyOn(service, 'deleteManyDeviceName')
        .mockRejectedValue(new Util.CustomError(500, 'Mocked error'));

      const errorResponseSpy = jest.spyOn(Util, 'errorResponse');
      errorResponseSpy.mockImplementation();

      const mockDto =
        new (DeleteDeviceNameDto as jest.Mock<DeleteDeviceNameDto>)();
      await controller.deleteDeviceNames(mockReq, mockRes, mockDto);

      expect(deleteDeviceNamesSpy).toHaveBeenCalled();
      expect(errorResponseSpy).toHaveBeenCalled();
    });
  });
});
