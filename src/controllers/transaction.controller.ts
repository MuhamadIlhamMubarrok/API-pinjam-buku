import { Controller, Post, Body, Res } from '@nestjs/common';
import { TransactionService } from '../services/transaction.service';
import { Created, errorResponse, sendResponse } from 'utils';
import { Response } from 'express';
import { CreateTransactionDTO } from 'src/dto/transaction.dto';

@Controller('/v2/transaction')
export class TransactionController {
  constructor(private transactionService: TransactionService) {}

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
}
