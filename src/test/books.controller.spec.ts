import { BookController } from '../controllers/books.controller';
import * as mongoose from 'mongoose';
import { REQUEST } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { Request, Response } from 'express';
import { MongooseConfigService } from '../db/db.config';

import {
  BorrowBookDTO,
  CreateBookDTO,
  GetBookListDTO,
  ReturnBookDTO,
} from '../dto/book.dto';
import { BookService } from '../services/books.service';

describe('Books Controller', () => {
  let booksController: BookController;

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
    aggregateBook: jest.fn(),
    createBook: jest.fn(),
    returnBooks: jest.fn(),
    borrowBooks: jest.fn(),
  };

  beforeEach(async () => {
    mockJson.mockClear();

    const module = await Test.createTestingModule({
      controllers: [BookController],
      providers: [
        {
          provide: BookService,
          useValue: mockService,
        },
        {
          provide: REQUEST,
          useValue: mockRequest,
        },
        MongooseConfigService,
      ],
    }).compile();

    booksController = module.get<BookController>(BookController);
  });

  afterAll(async () => {
    for (const connection of mongoose.connections) {
      connection.close();
    }
  });

  describe('getBooksList', () => {
    const mockPipelineResult = [
      {
        totalRecords: 1,
        data: [{}],
      },
    ];
    it('getBooksList - success', async () => {
      jest
        .spyOn(mockService, 'aggregateBook')
        .mockResolvedValue(mockPipelineResult);

      await booksController.getBookList(mockRes, {} as GetBookListDTO);

      expect(mockService.aggregateBook).toHaveBeenCalled();
    });
    it('getBooksList - error', async () => {
      const error = new Error('error');
      jest.spyOn(mockService, 'aggregateBook').mockRejectedValue(error);

      await expect(
        booksController.getBookList(mockRes, {} as GetBookListDTO),
      ).rejects.toThrow(expect.any(Error));
    });
  });

  describe('addBooksList', () => {
    it('addBooksList - success', async () => {
      jest.spyOn(mockService, 'createBook').mockResolvedValue({});

      await booksController.addBookList(mockRes, {} as CreateBookDTO);

      expect(mockService.createBook).toHaveBeenCalled();
    });
    it('addBooksList - error', async () => {
      const error = new Error('error');
      jest.spyOn(mockService, 'createBook').mockRejectedValue(error);

      await expect(
        booksController.addBookList(mockRes, {} as CreateBookDTO),
      ).rejects.toThrow(expect.any(Error));
    });
  });

  describe('BorrowBook', () => {
    it('borrowBooksList - success', async () => {
      jest.spyOn(mockService, 'borrowBooks').mockResolvedValue({});

      await booksController.borrowBook(mockRes, {} as BorrowBookDTO);

      expect(mockService.borrowBooks).toHaveBeenCalled();
    });
    it('borrowBooksList - error', async () => {
      const error = new Error('error');
      jest.spyOn(mockService, 'borrowBooks').mockRejectedValue(error);

      await expect(
        booksController.borrowBook(mockRes, {} as BorrowBookDTO),
      ).rejects.toThrow(expect.any(Error));
    });
  });

  describe('ReturnBook', () => {
    it('returnBooksList - success', async () => {
      jest.spyOn(mockService, 'returnBooks').mockResolvedValue({});

      await booksController.returnBook(mockRes, {} as ReturnBookDTO);

      expect(mockService.returnBooks).toHaveBeenCalled();
    });
    it('returnBooksList - error', async () => {
      const error = new Error('error');
      jest.spyOn(mockService, 'returnBooks').mockRejectedValue(error);

      await expect(
        booksController.returnBook(mockRes, {} as ReturnBookDTO),
      ).rejects.toThrow(expect.any(Error));
    });
  });
});
