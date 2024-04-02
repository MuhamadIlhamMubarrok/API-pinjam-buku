import { REQUEST } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { Request, Response } from 'express';
import * as mongoose from 'mongoose';
import { MongooseConfigService } from '../db/db.config';
import { PrelistController } from '../controllers/prelist.controller';
import { PrelistService } from '../services/prelist.service';

describe('prelist controller', () => {
  let prelistController: PrelistController;

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

  const mockPrelistService = {
    aggregatePrelist: jest.fn(),
    aggregatePrelistRequest: jest.fn(),
    createPrelist: jest.fn(),
    removePrelists: jest.fn(),
    removePrelistReqests: jest.fn(),
  };

  beforeEach(async () => {
    mockJson.mockClear();

    const module = await Test.createTestingModule({
      controllers: [PrelistController],
      providers: [
        {
          provide: PrelistService,
          useValue: mockPrelistService,
        },
        {
          provide: REQUEST,
          useValue: mockRequest,
        },
        MongooseConfigService,
      ],
    }).compile();

    prelistController = module.get<PrelistController>(PrelistController);
  });

  afterAll(async () => {
    for (const connection of mongoose.connections) {
      connection.close();
    }
  });

  describe('getPrelistList', () => {
    it('should be success', async () => {
      mockPrelistService.aggregatePrelist.mockResolvedValueOnce([{}]);

      await prelistController.getPrelistList(mockRes, {});

      expect(mockPrelistService.aggregatePrelist).toHaveBeenCalled();
    });

    it('should be error', async () => {
      mockPrelistService.aggregatePrelist.mockRejectedValueOnce([{}]);

      await expect(
        prelistController.getPrelistList(mockRes, {}),
      ).rejects.toThrow(expect.any(Error));
    });
  });

  describe('getPrelistOption', () => {
    it('should be sucess', async () => {
      mockPrelistService.aggregatePrelist.mockResolvedValueOnce([{}]);

      await prelistController.getPrelistOption(mockRes, {});

      expect(mockPrelistService.aggregatePrelist).toHaveBeenCalled();
    });

    it('should be error', async () => {
      mockPrelistService.aggregatePrelist.mockRejectedValueOnce([{}]);

      await expect(
        prelistController.getPrelistOption(mockRes, {}),
      ).rejects.toThrow(expect.any(Error));
    });
  });

  describe('getPrelistRequestList', () => {
    it('should be success', async () => {
      mockPrelistService.aggregatePrelistRequest.mockResolvedValueOnce([{}]);

      await prelistController.getPrelistRequestList(mockRes, '', {});

      expect(mockPrelistService.aggregatePrelistRequest).toHaveBeenCalled();
    });

    it('should be error', async () => {
      mockPrelistService.aggregatePrelistRequest.mockRejectedValueOnce([{}]);

      await expect(
        prelistController.getPrelistRequestList(mockRes, '', {}),
      ).rejects.toThrow(expect.any(Error));
    });
  });

  describe('getPrelistRequestOption', () => {
    it('should be success', async () => {
      mockPrelistService.aggregatePrelistRequest.mockResolvedValueOnce([{}]);

      await prelistController.getPrelistRequestOption(mockRes, {});

      expect(mockPrelistService.aggregatePrelistRequest).toHaveBeenCalled();
    });

    it('should be error', async () => {
      mockPrelistService.aggregatePrelistRequest.mockRejectedValueOnce([{}]);

      await expect(
        prelistController.getPrelistRequestOption(mockRes, {}),
      ).rejects.toThrow(expect.any(Error));
    });
  });

  describe('createPrelist', () => {
    it('should be success', async () => {
      await prelistController.createPrelist(mockRes, {
        id: [''],
        user: '',
      });

      expect(mockPrelistService.createPrelist).toHaveBeenCalled();
    });

    it('should be error', async () => {
      mockPrelistService.createPrelist.mockRejectedValueOnce({});
      await expect(
        prelistController.createPrelist(mockRes, {
          id: [''],
          user: '',
        }),
      ).rejects.toThrow(expect.any(Error));
    });
  });

  describe('removePrelists', () => {
    it('should be success', async () => {
      await prelistController.removePrelists(mockRes, { id: [] });

      expect(mockPrelistService.removePrelists).toHaveBeenCalled();
    });

    it('should be error', async () => {
      mockPrelistService.removePrelists.mockRejectedValueOnce({});
      await expect(
        prelistController.removePrelists(mockRes, { id: [] }),
      ).rejects.toThrow(expect.any(Error));
    });
  });

  describe('removePrelistRequests', () => {
    it('should be success', async () => {
      await prelistController.removePrelistRequests(mockRes, ' ', { id: [] });

      expect(mockPrelistService.removePrelistReqests).toHaveBeenCalled();
    });

    it('should be error', async () => {
      mockPrelistService.removePrelistReqests.mockRejectedValueOnce({});
      await expect(
        prelistController.removePrelistRequests(mockRes, ' ', { id: [] }),
      ).rejects.toThrow(expect.any(Error));
    });
  });
});
