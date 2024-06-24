import { Injectable, PipeTransform } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class GetBookListDTO {
  @ApiPropertyOptional({ type: 'string' })
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ type: 'string' })
  @IsOptional()
  page?: string | number;

  @ApiPropertyOptional({ type: 'string' })
  @IsOptional()
  limit?: string | number;

  @ApiPropertyOptional({ type: 'string' })
  @IsOptional()
  sortBy?: string;

  @ApiPropertyOptional({ type: 'string' })
  @IsOptional()
  sortOrder?: string | number;

  @ApiPropertyOptional({ type: 'string' })
  @IsOptional()
  status?: string | string[];

  @ApiPropertyOptional({ type: 'string' })
  @IsOptional()
  code?: string | string[];

  @ApiPropertyOptional({ type: 'string' })
  @IsOptional()
  title?: string | string[];

  @ApiPropertyOptional({ type: 'string' })
  @IsOptional()
  author?: string | string[];

  @ApiPropertyOptional({ type: 'string' })
  @IsOptional()
  stock?: string | number;

  @ApiPropertyOptional({ type: 'string' })
  @IsOptional()
  isBorrow?: string | boolean[];

  @ApiPropertyOptional({ type: 'string' })
  @IsOptional()
  isDamaged?: string | boolean[];
}

@Injectable()
export class GetBookListDTOPipe implements PipeTransform {
  transform(query: GetBookListDTO): GetBookListDTO {
    const {
      page,
      limit,
      sortOrder,
      status,
      code,
      title,
      isBorrow,
      author,
      stock,
      isDamaged,
    } = query;

    if (limit) {
      query.limit = parseInt(limit as string);
    }

    if (page) {
      query.page = parseInt(page as string);
    }

    if (sortOrder) {
      query.sortOrder = parseInt(sortOrder as string);
    }

    if (stock) {
      query.stock = parseInt(stock as string);
    }

    if (status) {
      query.status = JSON.parse(status as string);
    }

    if (code) {
      query.code = JSON.parse(code as string);
    }

    if (title) {
      query.title = JSON.parse(title as string);
    }

    if (author) {
      query.author = JSON.parse(author as string);
    }

    if (isBorrow) {
      query.isBorrow = JSON.parse(isBorrow as string);
    }

    if (isDamaged) {
      query.isDamaged = JSON.parse(isDamaged as string);
    }

    return query;
  }
}

export class CreateBookDTO {
  @ApiProperty({ type: 'string', example: 'name A' })
  @IsNotEmpty()
  code: string;

  @ApiProperty({ type: 'string', example: 'name A' })
  @IsNotEmpty()
  title: string;

  @ApiProperty({ type: 'string', example: 'name A' })
  @IsNotEmpty()
  author: string;

  @ApiProperty({ type: 'number', example: 1 })
  @IsNotEmpty()
  stock: number;
}

export class BorrowBookDTO {
  @ApiProperty({
    type: 'string',
    items: {
      type: 'string',
      example: '6642daf1e89622d22c6a6413',
    },
  })
  memberId: string;

  @ApiProperty({
    type: 'string',
    items: {
      type: 'string',
      example: '6642daf1e89622d22c6a6413',
    },
  })
  booksId: string;
}

export class ReturnBookDTO {
  @ApiProperty({
    type: 'string',
    items: {
      type: 'string',
      example: '6642daf1e89622d22c6a6413',
    },
  })
  memberId: string;

  @ApiProperty({
    type: 'string',
    items: {
      type: 'string',
      example: '6642daf1e89622d22c6a6413',
    },
  })
  booksId: string;
}
