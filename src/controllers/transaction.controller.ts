import {
  Controller,
  Post,
  Body,
  Res,
  Put,
  Param,
  Req,
  Get,
  UploadedFile,
} from '@nestjs/common';
import { TransactionService } from '../services/transaction.service';
import {
  Created,
  SplitImagePipe,
  Success,
  errorResponse,
  sendResponse,
} from 'utils';
import { Request, Response } from 'express';
import {
  ArrayOfIdDTO,
  CreateTransactionDTO,
  ReportRequestDTO,
  UpdateApprovalStatusDTO,
} from 'src/dto/transaction.dto';
import { getApprovalHistoryListPipeline } from 'src/pipeline/getApprovalHistoryList.pipeline';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('/v2/transaction')
export class TransactionController {
  constructor(private transactionService: TransactionService) {}

  @Get('request/:id/transaction-log')
  async getTransactionLogList(@Res() res: Response, @Param('id') id: string) {
    try {
      const result = await this.transactionService.getTransactionLogList(id);
      await sendResponse(
        res,
        new Success('report updated successfully', result),
      );
    } catch (error) {
      console.error(error);
      errorResponse(error);
    }
  }

  @Put('request/:id/mising')
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

      await this.transactionService.reportDamagedRequest(id, body.note);

      await sendResponse(res, new Success('report updated successfully'));
    } catch (error) {
      console.error(error);
      errorResponse(error);
    }
  }

  @Get(':id/approval-history')
  async getApprovalHistory(@Res() res: Response, @Param('id') id: string) {
    try {
      const list = await this.transactionService.aggregateApprovals(
        getApprovalHistoryListPipeline(id),
      );

      let result = { total: 0, groups: [] };
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
  async createTransaction(
    @Res() res: Response,
    @Body() body: CreateTransactionDTO[],
  ) {
    try {
      const result = await this.transactionService.createTransaction(body);

      // await this.transactionService.createTransactionChangelog(result, req.user.id);

      await sendResponse(
        res,
        new Created('Successfully created transaction', result),
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
    schema: {
      type: 'object',
      properties: {
        id: {
          type: 'array',
          items: {
            type: 'string',
            example: '65ea6fc61f39f83ef63583ec',
          },
        },
      },
    },
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

  @Put('request/:id/unassign')
  async unassignRequest(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: ArrayOfIdDTO,
  ) {
    try {
      await sendResponse(res, new Success('Successfully unassign request'));
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
  async handoverTransaction(@Res() res: Response, @Param('id') id: string) {
    try {
      const result = await this.transactionService.handoverTransaction(id);

      await sendResponse(
        res,
        new Success('Successfully created transaction', result),
      );
    } catch (error) {
      console.error(error);
      errorResponse(error);
    }
  }

  @Put('approve')
  async approveRequest(
    @Res() res: Response,
    @Body() body: UpdateApprovalStatusDTO,
  ) {
    try {
      await this.transactionService.approveRequest(body);

      await sendResponse(res, new Success('Successfully created transaction'));
    } catch (error) {
      console.error(error);
      errorResponse(error);
    }
  }
}
