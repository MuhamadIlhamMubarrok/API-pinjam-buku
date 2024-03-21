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
  ReportRequestDTO,
  UpdateApprovalStatusDTO,
} from 'src/dto/transaction.dto';
import { getApprovalHistoryListPipeline } from 'src/pipeline/getApprovalHistoryList.pipeline';

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

  @Get('request/:id/mising')
  async reportMissingRequest(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: string,
    @Body() body: ReportRequestDTO,
  ) {
    try {
      const result = await this.transactionService.reportMissingRequest(
        req.user.id,
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

  @Get('request/:id/damaged')
  async reportDamagedRequest(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: string,
    @Body() body: ReportRequestDTO,
  ) {
    try {
      await this.transactionService.reportDamagedRequest(
        req.user.id,
        id,
        body.note,
      );

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
  async cancelRequest(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: ArrayOfIdDTO,
  ) {
    try {
      const result = await this.transactionService.cancelRequest(
        body.id,
        req.user.id,
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

  @Put(':id/cancel')
  async cancelTransaction(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: string,
  ) {
    try {
      const result = await this.transactionService.cancelTransaction(
        id,
        req.user.id,
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

  @Put(':id/handover')
  async handoverTransaction(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: string,
  ) {
    try {
      const result = await this.transactionService.handoverTransaction(
        id,
        req.user.id,
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

  @Put('approve')
  async approveRequest(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: UpdateApprovalStatusDTO,
  ) {
    try {
      const result = await this.transactionService.approveRequest(
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
