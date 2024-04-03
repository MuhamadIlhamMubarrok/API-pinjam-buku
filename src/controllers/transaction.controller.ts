import {
  Controller,
  Post,
  Body,
  Res,
  Put,
  Param,
  Get,
  UploadedFile,
  Query,
} from '@nestjs/common';
import { TransactionService } from '../services/transaction.service';
import {
  Created,
  NotFound,
  SplitImagePipe,
  Success,
  errorResponse,
  sendResponse,
} from 'utils';
import { Response } from 'express';
import {
  ArrayOfIdDTO,
  CreateTransactionDTO,
  GetTransactionListDTO,
  GetTransactionListDTOPipe,
  GetTransactionOptionDTO,
  GetTransactionOptionsDTOPipe,
  ReportRequestDTO,
  UpdateApprovalStatusDTO,
} from '../dto/transaction.dto';
import { getApprovalHistoryListPipeline } from '../pipeline/getApprovalHistoryList.pipeline';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { ApprovalService } from '../services/approval.service';
import { AssetService } from '../services/asset.service';
import { UserService } from '../services/user.service';
import getTransactionOptionPipeline from '../pipeline/getTransactionOption.pipeline';
import getTransactionListPipeline from '../pipeline/getTransactionList.pipeline';

@Controller('/v2/transaction')
export class TransactionController {
  constructor(
    private transactionService: TransactionService,
    private approvalService: ApprovalService,
    private assetService: AssetService,
    private userService: UserService,
  ) {}

  @Get('')
  @ApiOperation({
    summary: 'get assignment transaction list',
  })
  @ApiQuery({
    name: 'Query Params',
    type: GetTransactionListDTO,
  })
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
    name: 'requestDate',
    required: false,
  })
  @ApiQuery({
    type: [Number],
    name: 'lastUpdate',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully get assignment transaction list',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'integer', example: 200 },
        message: {
          type: 'string',
          example: 'Successfully get assignment transaction list',
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
                  _id: { type: 'string', example: '6600ed5574ca4757a84d753d' },
                  transactionId: { type: 'string', example: 'ASG-240325-0001' },
                  status: { type: 'string', example: 'Waiting for Handover' },
                  group: { type: 'string', example: 'string' },
                  user: { type: 'string', example: 'string' },
                  manager: { type: 'string', example: 'string' },
                  lastUpdate: {
                    type: 'string',
                    example: '2024-03-25T03:19:49.372Z',
                  },
                  requestDate: {
                    type: 'string',
                    example: '2024-03-25T03:19:49.372Z',
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
  async getAssignmentTransactionList(
    @Res() res: Response,
    @Query(GetTransactionListDTOPipe) query: GetTransactionListDTO,
  ) {
    try {
      const list = await this.transactionService.aggregateTransactions(
        getTransactionListPipeline(query),
      );

      let response = { totalRecords: 0, data: [] };
      if (list.length > 0) {
        response = list[0];
      }
      await sendResponse(
        res,
        new Success('Successfully get assignment transaction list', response),
      );
    } catch (error) {
      console.error(error);
      errorResponse(error);
    }
  }

  @Get('options')
  @ApiOperation({ summary: 'Get assignment transaction Options' })
  @ApiQuery({ name: 'Query params', type: GetTransactionOptionDTO })
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
    name: 'statusOptions',
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
    description: 'Successfully get assignment transaction options',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'integer', example: 200 },
        message: {
          type: 'string',
          example: 'Successfully get assignment transaction options',
        },
        data: {
          type: 'object',
          properties: {
            groupOptions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  label: { type: 'string', example: 'Group 1' },
                  value: { type: 'integer', example: 1 },
                },
              },
            },
            userOptions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  label: { type: 'string', example: 'Mr. Good' },
                  value: { type: 'integer', example: 1 },
                },
              },
            },
            managerOptions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  label: { type: 'string', example: 'Mr. Good' },
                  value: { type: 'integer', example: 3 },
                },
              },
            },
            statusOptions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  label: { type: 'string', example: 'Waiting for Handover' },
                  value: { type: 'integer', example: 'Waiting for Handover' },
                },
              },
            },
          },
        },
      },
    },
  })
  // get assignment tranasction options
  async getAssignmentTransactionOptions(
    @Res() res: Response,
    @Query(GetTransactionOptionsDTOPipe) query: GetTransactionOptionDTO,
  ) {
    try {
      const optionPipeline = getTransactionOptionPipeline(query);

      const list =
        await this.transactionService.aggregateTransactions(optionPipeline);

      let response = { totalRecords: 0, data: [] };
      if (list.length > 0) {
        response = list[0];
      }
      await sendResponse(
        res,
        new Success(
          'Successfully get assignment transaction options',
          response,
        ),
      );
    } catch (error) {
      console.error(error);
      errorResponse(error);
    }
  }

  @Get('request/:id/transaction-log')
  @ApiOperation({
    summary: 'get transaction log list',
  })
  @ApiResponse({
    status: 201,
    description: 'Successfully get transaction log list',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'integer', example: 201 },
        message: {
          type: 'string',
          example: 'Successfully get transaction log list',
        },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              _id: { type: 'string', example: '6600ed5574ca4757a84d7543' },
              type: { type: 'string', example: 'Assignment' },
              transaction: {
                type: 'string',
                example: '6600ed5574ca4757a84d7543',
              },
              transactionId: { type: 'string', example: 'ASG-240325-0001' },
              assetId: { type: 'string', example: '6600ed5574ca4757a84d7543' },
              assetName: { type: 'string', example: 'asset name' },
              action: { type: 'string', example: 'Assignment requested' },
              userId: { type: 'string', example: '6600ed5574ca4757a84d7543' },
              userFullName: { type: 'string', example: 'user full name' },
              createdAt: {
                type: 'string',
                example: '2024-03-25T03:19:49.355Z',
              },
              updatedAt: {
                type: 'string',
                example: '2024-03-25T03:19:49.355Z',
              },
              __v: {
                type: 'integer',
                example: 2,
              },
            },
          },
        },
      },
    },
  })
  // retrieve transactions data per assignmentRequest
  async getTransactionLogList(@Res() res: Response, @Param('id') id: string) {
    try {
      const result = await this.transactionService.getTransactionLogList(id);
      await sendResponse(
        res,
        new Success('Successfully get transaction log list', result),
      );
    } catch (error) {
      console.error(error);
      errorResponse(error);
    }
  }
  @Put('request/cancel')
  @ApiOperation({
    summary: 'Cancel Requests Assignment',
  })
  @ApiBody({
    description: 'all assignmentRequest Id',
    type: ArrayOfIdDTO,
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully cancel designed request',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'integer', example: 200 },
        message: {
          type: 'string',
          example: 'Successfully cancel designed request',
        },
      },
    },
  })
  // cancel requests
  async cancelRequest(@Res() res: Response, @Body() body: ArrayOfIdDTO) {
    try {
      await this.transactionService.cancelRequest(body.id);

      await sendResponse(
        res,
        new Success('Successfully cancel designed request'),
      );
    } catch (error) {
      console.error(error);
      errorResponse(error);
    }
  }

  @Put('request/unassign')
  @ApiOperation({
    summary: 'unassign requests',
  })
  @ApiBody({
    description: 'request id',
    type: ArrayOfIdDTO,
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully unassign request',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'integer', example: 200 },
        message: {
          type: 'string',
          example: 'Successfully unassign request',
        },
      },
    },
  })
  // unassign requests
  async unassignRequest(@Res() res: Response, @Body() body: ArrayOfIdDTO) {
    try {
      await this.transactionService.unassignRequest(body.id);

      await sendResponse(res, new Success('Successfully unassign request'));
    } catch (error) {
      console.error(error);
      errorResponse(error);
    }
  }

  @Put('request/:id/missing')
  @ApiOperation({
    summary: 'report missing request',
  })
  @ApiBody({
    description: 'notes (optional)',
    type: ReportRequestDTO,
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'report updated successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'integer', example: 200 },
        message: {
          type: 'string',
          example: 'report updated successfully',
        },
        data: {
          type: 'object',
          properties: {
            assetName: {
              type: 'object',
              properties: {
                _id: { type: 'string', example: '65ea6fc61f39f83ef63583ed' },
                nameWithSequence: { type: 'string', example: 'Group B' },
                key: { type: 'integer', example: 1 },
              },
            },
            assetBrand: {
              type: 'object',
              properties: {
                _id: { type: 'string', example: '65ea6fc61f39f83ef63583ed' },
                name: { type: 'string', example: 'Brand B' },
                key: { type: 'integer', example: 1 },
              },
            },
            assetModel: {
              type: 'object',
              properties: {
                _id: { type: 'string', example: '65ea6fc61f39f83ef63583ed' },
                name: { type: 'string', example: 'Model B' },
                key: { type: 'integer', example: 1 },
              },
            },
            _id: { type: 'string', example: '65ea6fc61f39f83ef63583ed' },
            transaction: {
              type: 'string',
              example: '65ea6fc61f39f83ef63583ed',
            },
            asset: { type: 'string', example: '65ea6fc61f39f83ef63583ed' },
            status: { type: 'string', example: 'Report Missing' },
            isVerified: { type: 'boolean', example: false },
            createdAt: { type: 'string', example: '2024-03-25T01:48:26.653Z' },
            updatedAt: { type: 'string', example: '2024-03-25T01:48:26.653Z' },
            __v: { type: 'integer', example: 1 },
          },
        },
      },
    },
  })
  // report missing assignment request
  async reportMissingRequest(
    @Res() res: Response,
    @Param('id') id: string,
    @Body() body: ReportRequestDTO,
  ) {
    try {
      const result = await this.transactionService.reportMissingRequest(
        id,
        body.note,
      );
      await sendResponse(
        res,
        new Success('report updated successfully', result),
      );
    } catch (error) {
      console.error(error);
      errorResponse(error);
    }
  }

  @Put('request/:id/damaged')
  // report damaged assignment request
  async reportDamagedRequest(
    @Res() res: Response,
    @Param('id') id: string,
    @Body() body: ReportRequestDTO,
    @UploadedFile(SplitImagePipe)
    image?: {
      big?: string;
      medium?: string;
      small?: string;
      bigPath?: string;
      mediumPath?: string;
      smallPath?: string;
    },
  ) {
    try {
      console.log(image);

      await this.transactionService.reportDamagedRequest(id, image, body.note);

      await sendResponse(res, new Success('report updated successfully'));
    } catch (error) {
      console.error(error);
      errorResponse(error);
    }
  }

  @Get(':id/approval-history')
  // get all approval history data per transaction
  async getApprovalHistory(@Res() res: Response, @Param('id') id: string) {
    try {
      const list = await this.transactionService.aggregateApprovals(
        getApprovalHistoryListPipeline(id),
      );

      let result = { total: 0, data: [] };
      if (list.length > 0) {
        result = list[0];
      }

      await sendResponse(
        res,
        new Success('Successfully get group list', result),
      );
    } catch (error) {
      console.error(error);
      errorResponse(error);
    }
  }

  @Post('/')
  @ApiOperation({
    summary: 'create transaction',
  })
  @ApiBody({
    description: 'api body',
    type: [CreateTransactionDTO],
  })
  @ApiResponse({
    status: 201,
    description: 'Successfully created transaction',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'integer', example: 201 },
        message: {
          type: 'string',
          example: 'Successfully created transaction',
        },
      },
    },
  })
  // create assignment transaction + assignment request + assignment approval
  async createTransaction(
    @Res() res: Response,
    @Body() body: CreateTransactionDTO[],
  ) {
    try {
      const detailedData = [];

      for (const createData of body) {
        const asset = await this.assetService.getOneAsset({
          _id: createData.asset,
          status: 'Available',
        });
        const user = await this.userService.getOneUser({
          _id: createData.user,
          isDeleted: false,
          isActive: true,
        });
        if (asset && user) {
          detailedData.push({ asset, user });
        }
      }
      if (!detailedData.length) {
        throw new NotFound('Assets _id are invalid in request body');
      }

      const result =
        await this.transactionService.createTransaction(detailedData);

      await sendResponse(
        res,
        new Created('Successfully created transaction', result),
      );
    } catch (error) {
      console.error(error);
      errorResponse(error);
    }
  }

  @Put(':id/cancel')
  @ApiOperation({
    summary: 'Cancel Transaction Assignment',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully cancel designed transaction',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'integer', example: 200 },
        message: {
          type: 'string',
          example: 'Successfully cancel designed transaction',
        },
        data: {
          type: 'object',
          properties: {
            _id: { type: 'String', example: '65fba1acc5a08cf55f581c7f' },
            transactionId: { type: 'string', example: 'ASG-240321-0001' },
            manager: {
              type: 'object',
              properties: {
                _id: { type: 'string', example: '65fba1acc5a08cf55f581c7d' },
                fullName: { type: 'string', example: 'manager name' },
                key: { type: 'integer', example: 2 },
              },
            },
            group: {
              type: 'object',
              properties: {
                _id: { type: 'string', example: '65fba1acc5a08cf55f581c7d' },
                fullName: { type: 'string', example: 'group name' },
                key: { type: 'integer', example: 2 },
              },
            },
            assignedTo: {
              type: 'object',
              properties: {
                _id: { type: 'string', example: '65fba1acc5a08cf55f581c7d' },
                fullName: { type: 'string', example: 'user name' },
                key: { type: 'integer', example: 2 },
              },
            },
            status: { type: 'string', example: 'Cancelled' },
          },
        },
      },
    },
  })
  // cancel transaction and its related requests
  async cancelTransaction(@Res() res: Response, @Param('id') id: string) {
    try {
      const result = await this.transactionService.cancelTransaction(id);

      await sendResponse(
        res,
        new Success('Successfully cancel designed transaction', result),
      );
    } catch (error) {
      console.error(error);
      errorResponse(error);
    }
  }

  @Put(':id/handover')
  @ApiOperation({
    summary: 'assign transaction',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully assign transaction',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'integer', example: 200 },
        message: {
          type: 'string',
          example: 'Successfully assign transaction',
        },
        data: {
          type: 'object',
          properties: {
            manager: {
              type: 'object',
              properties: {
                _id: { type: 'string', example: '65fba1acc5a08cf55f581c7d' },
                fullName: { type: 'string', example: 'manager name' },
                key: { type: 'integer', example: 2 },
              },
            },
            group: {
              type: 'object',
              properties: {
                _id: { type: 'string', example: '65fba1acc5a08cf55f581c7d' },
                fullName: { type: 'string', example: 'group name' },
                key: { type: 'integer', example: 2 },
              },
            },
            assignedTo: {
              type: 'object',
              properties: {
                _id: { type: 'string', example: '65fba1acc5a08cf55f581c7d' },
                fullName: { type: 'string', example: 'user name' },
                key: { type: 'integer', example: 2 },
              },
            },
            _id: { type: 'String', example: '65fba1acc5a08cf55f581c7f' },
            transactionId: { type: 'string', example: 'ASG-240321-0001' },
            status: { type: 'string', example: 'Cancelled' },
            createdAt: { type: 'string', example: '2024-03-25T01:48:26.641Z' },
            updatedAt: { type: 'string', example: '2024-03-25T01:48:26.641Z' },
          },
        },
      },
    },
  })
  // assign transaction and its approved requests
  async handoverTransaction(@Res() res: Response, @Param('id') id: string) {
    try {
      console.log('testing');
      const result = await this.transactionService.handoverTransaction(id);

      await sendResponse(
        res,
        new Success('Successfully assign transaction', result),
      );
    } catch (error) {
      console.error(error);
      errorResponse(error);
    }
  }

  @Put('approve')
  // approve or reject requests
  async approval(
    @Res() res: Response,
    @Body() body: UpdateApprovalStatusDTO[],
  ) {
    try {
      await this.approvalService.approval(body);

      await sendResponse(res, new Success('Successfully created transaction'));
    } catch (error) {
      console.error(error);
      errorResponse(error);
    }
  }
}
