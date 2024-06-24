import { Inject, Injectable, Scope } from '@nestjs/common';
import { Model, PipelineStage } from 'mongoose';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { MongooseConfigService } from '../db/db.config';
import { IBooks, IMember } from 'schemas';
import { BooksSchema } from '../models/books.model';
import { BorrowBookDTO, CreateBookDTO, ReturnBookDTO } from '../dto/book.dto';
import { BadRequest, NotFound } from 'utils';
import { MemberSchema } from '../models/member.model';

@Injectable({ scope: Scope.REQUEST })
export class BookService {
  private bookModel: Model<IBooks>;
  private memberModel: Model<IMember>;
  constructor(
    @Inject(MongooseConfigService)
    private connectionManager: MongooseConfigService,
    @Inject(REQUEST)
    private req: Request,
  ) {
    this.setConnection();
  }
  public setConnection = async () => {
    this.bookModel = (await this.connectionManager.getModel(
      `mongodb://127.0.0.1:27017/00000_perpustakaan`,
      'book',
      BooksSchema,
    )) as Model<IBooks>;

    this.memberModel = (await this.connectionManager.getModel(
      `mongodb://127.0.0.1:27017/00000_perpustakaan`,
      'member',
      MemberSchema,
    )) as Model<IMember>;
  };

  async aggregateBook(pipeline: PipelineStage[]): Promise<any[]> {
    return await this.bookModel.aggregate(pipeline);
  }

  async createBook(body: CreateBookDTO) {
    return await this.bookModel.create({
      code: body.code,
      title: body.title,
      stock: body.stock,
      author: body.author,
      borrower: null,
      isBorrow: null,
      expiredBook: null,
      isDamaged: null,
    });
  }

  async borrowBooks(body: BorrowBookDTO) {
    const { memberId, booksId } = body;
    const member = await this.memberModel.findOne({
      _id: memberId,
    });

    const book = await this.bookModel.findOne({
      _id: booksId,
    });
    if (!book) {
      throw new NotFound('book Data Not Found');
    }

    if (book.borrower !== null) {
      throw new BadRequest('The book has been borrowed');
    }

    const now = new Date();
    if (new Date(member.expiredPunishment) > now) {
      throw new BadRequest('Member is currently under punishment');
    }

    if (!member) {
      throw new NotFound('Member Data Not Found');
    }
    const borrowedBooksCount = await this.bookModel.countDocuments({
      borrower: memberId,
    });

    if (borrowedBooksCount >= 2) {
      throw new BadRequest('Member has already borrowed 2 books');
    }

    const today = new Date();
    const expiredBooks = new Date(today);
    expiredBooks.setDate(today.getDate() + 7);

    return await this.bookModel.updateOne(
      { _id: booksId },
      {
        borrower: memberId,
        isBorrow: true,
        expiredBook: expiredBooks,
      },
      {
        new: true,
      },
    );
  }

  async returnBooks(body: ReturnBookDTO) {
    const { booksId, memberId } = body;

    const book = await this.bookModel.findOne({
      _id: booksId,
    });
    if (!book) {
      throw new NotFound('book Data Not Found');
    }

    const now = new Date();
    const newExpiredPunishment = new Date(now);
    newExpiredPunishment.setDate(now.getDate() + 3);
    if (book.expiredBook < now) {
      await this.memberModel.updateOne(
        { _id: memberId },
        { expiredPunishment: newExpiredPunishment },
      );
    }

    return await this.bookModel.updateOne(
      { _id: booksId },
      {
        borrower: null,
        isBorrow: false,
        expiredBook: null,
      },
      {
        new: true,
      },
    );
  }
}
