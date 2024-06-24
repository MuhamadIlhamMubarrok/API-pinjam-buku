import { Controller, Res, Get, Query, Body, Post, Put } from '@nestjs/common';
import { Success, errorResponse, sendResponse } from 'utils';
import { Response } from 'express';

import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BookService } from '../services/books.service';
import {
  BorrowBookDTO,
  CreateBookDTO,
  GetBookListDTO,
  GetBookListDTOPipe,
  ReturnBookDTO,
} from '../dto/book.dto';
import getBooksListPipeline from '../pipeline/getBooksList.pipeline';

@ApiTags('Books')
@Controller('/v2/book')
export class BookController {
  constructor(private bookService: BookService) {}

  @Get('')
  @ApiOperation({
    summary: 'get Book list',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully get book list',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'integer', example: 200 },
        message: {
          type: 'string',
          example: 'Successfully get book list',
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
                  _id: { type: 'string', example: '66796a3168064885fe9a5fd3' },
                  code: { type: 'string', example: 'name A' },
                  borrower: { type: 'string', example: null, nullable: true },
                  isBorrow: { type: 'boolean', example: null, nullable: true },
                  expiredBook: {
                    type: 'string',
                    example: null,
                    nullable: true,
                  },
                  title: { type: 'string', example: 'name A' },
                  isDamaged: { type: 'boolean', example: null, nullable: true },
                  stock: { type: 'integer', example: 1 },
                },
              },
            },
          },
        },
      },
    },
  })
  // get assignment transaction data
  async getBookList(
    @Res() res: Response,
    @Query(GetBookListDTOPipe) query: GetBookListDTO,
  ) {
    try {
      const list = await this.bookService.aggregateBook(
        getBooksListPipeline(query),
      );

      let response = { totalRecords: 0, data: [] };
      if (list.length > 0) {
        response = list[0];
      }
      await sendResponse(
        res,
        new Success('Successfully get book list', response),
      );
    } catch (error) {
      console.error(error);
      errorResponse(error);
    }
  }

  @Post('/add-book')
  @ApiOperation({
    summary: 'get Book list',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully add book list',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'integer', example: 200 },
        message: {
          type: 'string',
          example: 'Successfully add book list',
        },
      },
    },
  })
  // get assignment transaction data
  async addBookList(@Res() res: Response, @Body() body: CreateBookDTO) {
    try {
      await this.bookService.createBook(body);

      await sendResponse(res, new Success('Successfully Add book'));
    } catch (error) {
      console.error(error);
      errorResponse(error);
    }
  }

  @Put('borrow-books')
  @ApiOperation({
    summary: 'borrow Book',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully borrow book',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'integer', example: 200 },
        message: {
          type: 'string',
          example: 'Successfully borrow book',
        },
      },
    },
  })
  async borrowBook(@Res() res: Response, @Body() body: BorrowBookDTO) {
    try {
      await this.bookService.borrowBooks(body);

      sendResponse(res, new Success('Successfully borrow book'));
    } catch (error) {
      console.error(error);
      errorResponse(error);
    }
  }

  @Put('return-books')
  @ApiOperation({
    summary: 'return Book',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully Return Book ',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'integer', example: 200 },
        message: {
          type: 'string',
          example: 'Successfully borrow Book',
        },
      },
    },
  })
  async returnBook(@Res() res: Response, @Body() body: ReturnBookDTO) {
    try {
      await this.bookService.returnBooks(body);

      sendResponse(res, new Success('Successfully Retrun Book'));
    } catch (error) {
      console.error(error);
      errorResponse(error);
    }
  }
}
