import { MemberController } from '../controllers/member.controller';
import * as mongoose from 'mongoose';
import { REQUEST } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { Request, Response } from 'express';
import { MongooseConfigService } from '../db/db.config';
import { MemberService } from '../services/member.service';
import { CreateMemberDTO, GetMemberListDTO } from '../dto/member.dto';

describe('Member Controller', () => {
  let memberController: MemberController;

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

  const mockService = {
    aggregateMember: jest.fn(),
    createMember: jest.fn(),
  };

  beforeEach(async () => {
    mockJson.mockClear();

    const module = await Test.createTestingModule({
      controllers: [MemberController],
      providers: [
        {
          provide: MemberService,
          useValue: mockService,
        },
        {
          provide: REQUEST,
          useValue: mockRequest,
        },
        MongooseConfigService,
      ],
    }).compile();

    memberController = module.get<MemberController>(MemberController);
  });

  afterAll(async () => {
    for (const connection of mongoose.connections) {
      connection.close();
    }
  });

  describe('getMemberList', () => {
    const mockPipelineResult = [
      {
        totalRecords: 1,
        data: [{}],
      },
    ];
    it('getMemberList - success', async () => {
      jest
        .spyOn(mockService, 'aggregateMember')
        .mockResolvedValue(mockPipelineResult);

      await memberController.getMemberList(mockRes, {} as GetMemberListDTO);

      expect(mockService.aggregateMember).toHaveBeenCalled();
    });
    it('getMemberList - error', async () => {
      const error = new Error('error');
      jest.spyOn(mockService, 'aggregateMember').mockRejectedValue(error);

      await expect(
        memberController.getMemberList(mockRes, {} as GetMemberListDTO),
      ).rejects.toThrow(expect.any(Error));
    });
  });

  describe('addMemberList', () => {
    it('addMemberList - success', async () => {
      jest
        .spyOn(mockService, 'createMember')
        .mockResolvedValue({ name: 'ilham' });

      await memberController.addMemberList(mockRes, {
        name: 'ilham',
      } as CreateMemberDTO);

      expect(mockService.createMember).toHaveBeenCalled();
    });
    it('addMemberList - error', async () => {
      const error = new Error('error');
      jest.spyOn(mockService, 'createMember').mockRejectedValue(error);

      await expect(
        memberController.addMemberList(mockRes, {
          name: 'ilham',
        } as CreateMemberDTO),
      ).rejects.toThrow(expect.any(Error));
    });
  });
});
