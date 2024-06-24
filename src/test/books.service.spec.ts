import { Test, TestingModule } from '@nestjs/testing';
import { MongooseConfigService } from '../db/db.config';
import { BookService } from '../services/books.service';
import { BadRequest, NotFound } from 'utils';

describe('BookService', () => {
  let service: BookService;

  const model = {
    create: jest.fn(),
    findOne: jest.fn(),
    aggregate: jest.fn(),
    countDocuments: jest.fn(),
    updateOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookService,
        {
          provide: MongooseConfigService,
          useValue: {
            getModel: jest.fn().mockResolvedValue(model),
          },
        },
        {
          provide: 'REQUEST',
          useValue: {
            book: {
              companyCode: 'test',
            },
          },
        },
      ],
    }).compile();

    service = await module.resolve<BookService>(BookService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should set connection', async () => {
    await service.setConnection();
    expect(service['bookModel']).toBeDefined();
  });

  it('aggregateBook', async () => {
    model.aggregate.mockResolvedValue({});
    await service.aggregateBook([]);

    expect(model.aggregate).toHaveBeenCalled();
  });

  it('createBook', async () => {
    const mockBody = {
      code: 'body.code',
      title: 'body.title',
      stock: 1,
      author: 'body.author',
    };
    model.create.mockResolvedValue({});
    await service.createBook(mockBody);

    expect(model.aggregate).toHaveBeenCalled();
  });

  it('should throw NotFound if book is not found', async () => {
    model.findOne.mockResolvedValue(null);

    await expect(
      service.borrowBooks({ memberId: 'someMemberId', booksId: 'someBookId' }),
    ).rejects.toThrow(new NotFound('book Data Not Found'));
  });

  it('should throw BadRequest if book is already borrowed', async () => {
    model.findOne.mockResolvedValue({ borrower: 'someone' });

    await expect(
      service.borrowBooks({ memberId: 'someMemberId', booksId: 'someBookId' }),
    ).rejects.toThrow(new BadRequest('The book has been borrowed'));
  });

  it('should throw NotFound if member is not found', async () => {
    model.findOne.mockResolvedValue({ borrower: null });
    model.findOne.mockResolvedValue(null);

    await expect(
      service.borrowBooks({ memberId: 'someMemberId', booksId: 'someBookId' }),
    ).rejects.toThrow(new NotFound('book Data Not Found'));
  });

  it('should throw BadRequest if member has already borrowed 2 books', async () => {
    model.findOne.mockResolvedValue({ expiredPunishment: new Date() });
    model.findOne.mockResolvedValue({ borrower: null });
    model.countDocuments.mockResolvedValue(2);

    await expect(
      service.borrowBooks({ memberId: 'someMemberId', booksId: 'someBookId' }),
    ).rejects.toThrow(new BadRequest('Member has already borrowed 2 books'));
  });

  it('should update book with memberId and set expiration date', async () => {
    const memberId = 'someMemberId';
    const booksId = 'someBookId';
    model.findOne.mockResolvedValue({ expiredPunishment: new Date() });
    model.findOne.mockResolvedValue({ borrower: null });
    model.countDocuments.mockResolvedValue(1);
    model.updateOne.mockResolvedValue({ nModified: 1 });

    const result = await service.borrowBooks({ memberId, booksId });

    expect(result).toEqual({ nModified: 1 });
    expect(model.updateOne).toHaveBeenCalledWith(
      { _id: booksId },
      expect.objectContaining({
        borrower: memberId,
        isBorrow: true,
        expiredBook: expect.any(Date),
      }),
      { new: true },
    );
  });

  it('should throw NotFound if book is not found', async () => {
    model.findOne.mockResolvedValue(null);

    await expect(
      service.returnBooks({ booksId: 'someBookId', memberId: 'someMemberId' }),
    ).rejects.toThrow(new NotFound('book Data Not Found'));
  });

  it('should update member punishment if book is returned late', async () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);
    model.findOne.mockResolvedValue({ expiredBook: pastDate });

    await service.returnBooks({
      booksId: 'someBookId',
      memberId: 'someMemberId',
    });

    const now = new Date();
    const newExpiredPunishment = new Date(now);
    newExpiredPunishment.setDate(now.getDate() + 3);

    expect(model.updateOne).toHaveBeenCalledWith(
      { _id: 'someMemberId' },
      { expiredPunishment: newExpiredPunishment },
    );
  });

  it('should not update member punishment if book is returned on time', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);
    model.findOne.mockResolvedValue({ expiredBook: futureDate });

    await service.returnBooks({
      booksId: 'someBookId',
      memberId: 'someMemberId',
    });

    expect(model.updateOne).toHaveBeenCalled();
  });

  it('should update the book to set borrower to null and isBorrow to false', async () => {
    model.findOne.mockResolvedValue({ expiredBook: new Date() });

    await service.returnBooks({
      booksId: 'someBookId',
      memberId: 'someMemberId',
    });

    expect(model.updateOne).toHaveBeenCalledWith(
      { _id: 'someBookId' },
      {
        borrower: null,
        isBorrow: false,
        expiredBook: null,
      },
      { new: true },
    );
  });
});
