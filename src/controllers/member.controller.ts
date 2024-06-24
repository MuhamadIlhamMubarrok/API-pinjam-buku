import { Controller, Res, Get, Query, Body, Post } from '@nestjs/common';
import { Success, errorResponse, sendResponse } from 'utils';
import { Response } from 'express';
import {
  CreateMemberDTO,
  GetMemberListDTO,
  GetMemberListDTOPipe,
} from '../dto/member.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MemberService } from '../services/member.service';
import getMemberListPipeline from '../pipeline/getMemberList.pipeline';

@ApiTags('Member')
@Controller('/v2/member')
export class MemberController {
  constructor(private memberService: MemberService) {}

  @Get('')
  @ApiOperation({
    summary: 'get Member list',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully get member list',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'integer', example: 200 },
        message: {
          type: 'string',
          example: 'Successfully get member list',
        },
        data: {
          type: 'object',
          properties: {
            totalRecords: { type: 'integer', example: 1 },
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  _id: { type: 'string', example: '66794b061b0c74bcce828ec5' },
                  name: { type: 'string', example: 'ilham' },
                  isPunisment: { type: 'boolean', example: false },
                  expiredPunisment: {
                    type: 'string',
                    example: '2024-07-01T10:31:34.301Z',
                  },
                },
              },
            },
          },
        },
      },
    },
  })
  // get assignment transaction data
  async getMemberList(
    @Res() res: Response,
    @Query(GetMemberListDTOPipe) query: GetMemberListDTO,
  ) {
    try {
      const list = await this.memberService.aggregateMember(
        getMemberListPipeline(query),
      );

      let response = { totalRecords: 0, data: [] };
      if (list.length > 0) {
        response = list[0];
      }
      await sendResponse(
        res,
        new Success('Successfully get member list', response),
      );
    } catch (error) {
      console.error(error);
      errorResponse(error);
    }
  }

  @Post('/add-member')
  @ApiOperation({
    summary: 'get Member list',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully add member list',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'integer', example: 200 },
        message: {
          type: 'string',
          example: 'Successfully add member list',
        },
      },
    },
  })
  // get assignment transaction data
  async addMemberList(@Res() res: Response, @Body() body: CreateMemberDTO) {
    try {
      await this.memberService.createMember(body);

      await sendResponse(res, new Success('Successfully Add member'));
    } catch (error) {
      console.error(error);
      errorResponse(error);
    }
  }
}
