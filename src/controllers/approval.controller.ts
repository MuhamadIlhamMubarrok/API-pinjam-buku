import {
  Controller,
  Body,
  Res,
  Put,
  Param,
  Get,
  Query,
  Req,
} from '@nestjs/common';
import { Success, errorResponse, sendResponse } from 'utils';
import { Response, Request } from 'express';
import { UpdateApprovalStatusDTO } from '../dto/transaction.dto';
import { getApprovalHistoryPipeline } from '../pipeline/getApprovalHistory.pipeline';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ApprovalService } from '../services/approval.service';
import {
  GetApprovalListDTO,
  GetApprovalListDTOPipe,
  GetApprovalOptionDTO,
  GetApprovalOptionsDTOPipe,
  GetApprovalPerTransactionDTO,
  GetApprovalPerTransactionDTOPipe,
  GetApprovalPerTransactionOptionDTO,
  GetApprovalPerTransactionOptionDTOPipe,
} from '../dto/approval.dto';
import getApprovalListPipeline from '../pipeline/getApprovalList.pipeline';
import getApprovalOptionPipeline from '../pipeline/getApprovalOption.pipeline';
import getApprovalPerTransactionOptionPipeline from '../pipeline/getApprovalPerTransactionOption.pipeline';
import getApprovalPerTransactionPipeline from '../pipeline/getApprovalPerTransaction.pipeline';

@ApiTags('Assignment Approval')
@ApiBearerAuth('access-token')
@Controller('/v2/approval')
export class ApprovalController {
  constructor(private approvalService: ApprovalService) {}

  @Get()
  @ApiOperation({
    summary: 'get assignmentApproval data',
  })
  @ApiQuery({ name: 'Query params', type: GetApprovalListDTO })
  @ApiQuery({
    type: String,
    name: 'search',
    required: false,
  })
  @ApiQuery({
    type: Number,
    name: 'page',
    required: false,
  })
  @ApiQuery({
    type: Number,
    name: 'limit',
    required: false,
  })
  @ApiQuery({
    type: String,
    name: 'sortBy',
    required: false,
  })
  @ApiQuery({
    type: Number,
    name: 'sortOrder',
    required: false,
  })
  @ApiQuery({
    type: [String],
    name: 'status',
    required: false,
  })
  @ApiQuery({
    type: [Number],
    name: 'group',
    required: false,
  })
  @ApiQuery({
    type: [Number],
    name: 'user',
    required: false,
  })
  @ApiQuery({
    type: [Number],
    name: 'manager',
    required: false,
  })
  @ApiQuery({
    type: [Number],
    name: 'lastUpdate',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully get Approval list',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'integer', example: 200 },
        message: {
          type: 'string',
          example: 'Successfully get Approval list',
        },
        data: {
          type: 'object',
          properties: {
            totalRecords: { type: 'integer', example: 3 },
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  _id: { type: 'string', example: 'ASG-240404-0024' },
                  status: { type: 'string', example: 'Need Approval' },
                  group: { type: 'string', example: 'group name' },
                  user: { type: 'string', example: 'user name' },
                  manager: { type: 'string', example: 'manager name' },
                  totalAsset: { type: 'number', example: 1 },
                  lastUpdate: {
                    type: 'string',
                    example: '2024-04-04T02:16:33.919Z',
                  },
                },
              },
            },
          },
        },
      },
    },
  })

  // get assignmentApproval list data grouped by assignmentTransaction
  async getApprovalList(
    @Req() req: Request,
    @Res() res: Response,
    @Query(GetApprovalListDTOPipe) query: GetApprovalListDTO,
  ) {
    try {
      query.loggedInUser = req.user.id;

      const list = await this.approvalService.aggregateApprovals(
        getApprovalListPipeline(query),
      );

      let response = { totalRecords: 0, data: [] };
      if (list.length > 0) {
        response = list[0];
      }
      await sendResponse(
        res,
        new Success('Successfully get Approval list', response),
      );
    } catch (error) {
      console.error(error);
      errorResponse(error);
    }
  }

  @Get('options')
  @ApiOperation({ summary: 'get assignment Approval options' })
  @ApiQuery({ name: 'Query params', type: GetApprovalOptionDTO })
  @ApiQuery({
    name: 'statusOptions',
    type: String,
    example: true,
    required: false,
  })
  @ApiQuery({
    name: 'userOptions',
    type: String,
    example: true,
    required: false,
  })
  @ApiQuery({
    name: 'groupOptions',
    type: String,
    example: true,
    required: false,
  })
  @ApiQuery({
    name: 'managerOptions',
    type: String,
    example: true,
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully get Approval list',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'integer', example: 200 },
        message: {
          type: 'string',
          example: 'Successfully get Approval list',
        },
        data: {
          type: 'object',
          properties: {
            groupOptions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  label: { type: 'string', example: 'first Reader' },
                  value: { type: 'integer', example: 1 },
                },
              },
            },
            userOptions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  label: { type: 'string', example: 'first Reader' },
                  value: { type: 'integer', example: 1 },
                },
              },
            },
            managerOptions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  label: { type: 'string', example: 'first Reader' },
                  value: { type: 'integer', example: 1 },
                },
              },
            },
            statusOptions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  label: { type: 'string', example: 'Need Approval' },
                  value: { type: 'string', example: 'Need Approval' },
                },
              },
            },
          },
        },
      },
    },
  })
  // get assignmentApproval options
  async getApprovalOptions(
    @Req() req: Request,
    @Res() res: Response,
    @Query(GetApprovalOptionsDTOPipe) query: GetApprovalOptionDTO,
  ) {
    try {
      query.loggedInUser = req.user.id;

      const list = await this.approvalService.aggregateApprovals(
        getApprovalOptionPipeline(query),
      );

      let response = { totalRecords: 0, data: [] };
      if (list.length > 0) {
        response = list[0];
      }
      await sendResponse(
        res,
        new Success('Successfully get Approval list', response),
      );
    } catch (error) {
      console.error(error);
      errorResponse(error);
    }
  }

  @Put('approve')
  @ApiOperation({
    summary: 'Update assignment request approval status',
  })
  @ApiBody({
    description: 'Request Body',
    type: [UpdateApprovalStatusDTO],
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully update request approval status',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: 'Successfully update request approval status',
        },
      },
    },
  })
  // approve or reject requests
  async approval(
    @Res() res: Response,
    @Body() body: UpdateApprovalStatusDTO[],
  ) {
    try {
      await this.approvalService.approval(body);

      await sendResponse(
        res,
        new Success('Successfully update request approval status'),
      );
    } catch (error) {
      console.error(error);
      errorResponse(error);
    }
  }

  @Get('transaction/:id')
  @ApiOperation({ summary: 'Get detailed approval data per transaction' })
  @ApiQuery({ name: 'Query params', type: GetApprovalPerTransactionDTO })
  @ApiQuery({
    type: String,
    name: 'search',
    required: false,
  })
  @ApiQuery({
    type: Number,
    name: 'page',
    required: false,
  })
  @ApiQuery({
    type: Number,
    name: 'limit',
    required: false,
  })
  @ApiQuery({
    type: String,
    name: 'sortBy',
    required: false,
  })
  @ApiQuery({
    type: Number,
    name: 'sortOrder',
    required: false,
  })
  @ApiQuery({
    type: [Number],
    name: 'asset',
    required: false,
  })
  @ApiQuery({
    type: [Number],
    name: 'brand',
    required: false,
  })
  @ApiQuery({
    type: [Number],
    name: 'model',
    required: false,
  })
  @ApiQuery({
    type: [String],
    name: 'status',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully get Approval list per transaction',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'integer', example: 200 },
        message: {
          type: 'string',
          example: 'Successfully get Approval list per transaction',
        },
        data: {
          type: 'object',
          properties: {
            totalRecords: { type: 'integer', example: 3 },
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  _id: { type: 'string', example: '6603e10ad07e13b634630f1d' },
                  isApproved: { type: 'boolean', example: true },
                  notes: { type: 'string', example: 'this is notes' },
                  name: { type: 'string', example: 'asset name' },
                  brand: { type: 'string', example: 'brand name' },
                  model: { type: 'string', example: 'model name' },
                  imageSmall: { type: 'string', example: 'small.jpg' },
                  imageMedium: { type: 'string', example: 'medium.jpg' },
                  imageBig: { type: 'string', example: 'big.jpg' },
                },
              },
            },
          },
        },
      },
    },
  })
  // get assignmentApproval data detail per assignmentTranscation
  async getApprovalPerTransaction(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') transactionId: string,
    @Query(GetApprovalPerTransactionDTOPipe)
    query: GetApprovalPerTransactionDTO,
  ) {
    try {
      query.transaction = transactionId;
      query.loggedInUser = req.user.id;

      const list = await this.approvalService.aggregateApprovals(
        getApprovalPerTransactionPipeline(query),
      );

      let response = { totalRecords: 0, data: [] };
      if (list.length > 0) {
        response = list[0];
      }
      await sendResponse(
        res,
        new Success('Successfully get Approval list per transaction', response),
      );
    } catch (error) {
      console.error(error);
      errorResponse(error);
    }
  }

  @Get('transaction/:id/options')
  @ApiOperation({ summary: 'Get approval per transaction Options' })
  @ApiQuery({ name: 'Query params', type: GetApprovalPerTransactionOptionDTO })
  @ApiQuery({
    name: 'assetOptions',
    type: String,
    example: true,
    required: false,
  })
  @ApiQuery({
    name: 'brandOptions',
    type: String,
    example: true,
    required: false,
  })
  @ApiQuery({
    name: 'modelOptions',
    type: String,
    example: true,
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully get Approval list per transaction options',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'integer', example: 200 },
        message: {
          type: 'string',
          example: 'Successfully get Approval list per transaction options',
        },
        data: {
          type: 'object',
          properties: {
            assetOptions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  label: { type: 'string', example: 'asset name' },
                  value: { type: 'integer', example: 1 },
                },
              },
            },
            brandOptions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  label: { type: 'string', example: 'brand name' },
                  value: { type: 'integer', example: 1 },
                },
              },
            },
            modelOptions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  label: { type: 'string', example: 'model name' },
                  value: { type: 'integer', example: 1 },
                },
              },
            },
          },
        },
      },
    },
  })
  // get assignmentApproval per assignmentTransaction options
  async getApprovalPerTransactionOptions(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') transactionId: string,
    @Query(GetApprovalPerTransactionOptionDTOPipe)
    query: GetApprovalPerTransactionOptionDTO,
  ) {
    try {
      query.transaction = transactionId;
      query.loggedInUser = req.user.id;

      const list = await this.approvalService.aggregateApprovals(
        getApprovalPerTransactionOptionPipeline(query),
      );

      let response = { totalRecords: 0, data: [] };
      if (list.length > 0) {
        response = list[0];
      }
      await sendResponse(
        res,
        new Success(
          'Successfully get Approval list per transaction options',
          response,
        ),
      );
    } catch (error) {
      console.error(error);
      errorResponse(error);
    }
  }

  @Get('transaction/:id/history')
  // get all approval history data per transaction
  async getApprovalHistory(@Res() res: Response, @Param('id') id: string) {
    try {
      const list = await this.approvalService.aggregateApprovals(
        getApprovalHistoryPipeline(id),
      );

      await sendResponse(
        res,
        new Success('Successfully get approval history list', list[0]),
      );
    } catch (error) {
      console.error(error);
      errorResponse(error);
    }
  }
}
