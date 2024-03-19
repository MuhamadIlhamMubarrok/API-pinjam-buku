import {
  Controller,
  Post,
  Body,
  Res,
  Put,
  Param,
  Req,
  Get,
} from '@nestjs/common';
import { TransactionService } from '../services/transaction.service';
import { Created, Success, errorResponse, sendResponse } from 'utils';
import { Request, Response } from 'express';
import {
  ArrayOfIdDTO,
  CreateTransactionDTO,
  UpdateApprovalStatusDTO,
} from 'src/dto/transaction.dto';
import { getApprovalHistoryListPipeline } from 'src/pipeline/getApprovalHistoryList.pipeline';

@Controller('/v2/transaction')
export class TransactionController {
  constructor(private transactionService: TransactionService) {}

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
  /*
    body = [
            {
                "asset":"65ea6fc61f39f83ef63583ed",
                "user":"65f1161330abfb9184993b90"
            },
            {
                "asset":"65ea7d29f5cd331b5beed2b1",
                "user":"6454c4253dd1017f28689572"
            }
        ]
*/
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
  async cancelRequest(@Res() res: Response, @Body() body: ArrayOfIdDTO) {
    try {
      const result = await this.transactionService.cancelRequest(body.id);

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
  async cancelTransaction(@Res() res: Response, @Param('id') id: string) {
    try {
      const result = await this.transactionService.cancelTransaction(id);

      await sendResponse(
        res,
        new Created('Successfully created transaction', result),
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
        new Created('Successfully created transaction', result),
      );
    } catch (error) {
      console.error(error);
      errorResponse(error);
    }
  }

  @Put('approval-status')
  async updateApprovalStatus(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: UpdateApprovalStatusDTO,
  ) {
    try {
      const result = await this.transactionService.updateApprovalStatus(
        req.user.id,
        body,
      );

      await sendResponse(
        res,
        new Created('Successfully created transaction', result),
      );
    } catch (error) {
      console.error(error);
      errorResponse(error);
    }
  }
}
