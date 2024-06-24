import { Injectable, PipeTransform } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class GetMemberListDTO {
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
  name?: string | string[];

  @ApiPropertyOptional({ type: 'string' })
  @IsOptional()
  isPunisment?: string | boolean[];
}

@Injectable()
export class GetMemberListDTOPipe implements PipeTransform {
  transform(query: GetMemberListDTO): GetMemberListDTO {
    const { page, limit, sortOrder, status, name, isPunisment } = query;

    if (limit) {
      query.limit = parseInt(limit as string);
    }

    if (page) {
      query.page = parseInt(page as string);
    }

    if (sortOrder) {
      query.sortOrder = parseInt(sortOrder as string);
    }

    if (status) {
      query.status = JSON.parse(status as string);
    }

    if (name) {
      query.name = JSON.parse(name as string);
    }

    if (isPunisment) {
      query.isPunisment = JSON.parse(isPunisment as string);
    }

    return query;
  }
}

export class CreateMemberDTO {
  @ApiProperty({ type: 'string', example: 'name A' })
  @IsNotEmpty()
  name: string;
}
