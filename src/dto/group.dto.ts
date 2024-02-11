import { Injectable, PipeTransform } from '@nestjs/common';
import { IsString, IsDefined, IsOptional } from 'class-validator';
import { Types } from 'mongoose';

export class GetGroupDTO {
  @IsOptional()
  search?: string;

  @IsOptional()
  page?: string | number;

  @IsOptional()
  limit?: string | number;

  @IsOptional()
  brands?: number[] | string;

  @IsOptional()
  models?: number[] | string;

  @IsOptional()
  sortBy?: string;

  @IsOptional()
  sortOrder?: string | number;
}

@Injectable()
export class GetGroupDTOPipe implements PipeTransform {
  transform(query: GetGroupDTO): GetGroupDTO {
    const { limit, page, sortOrder, models, brands } = query;

    if (limit) {
      query.limit = parseInt(limit as string);
    }

    if (page) {
      query.page = parseInt(page as string);
    }

    if (sortOrder) {
      query.sortOrder = parseInt(sortOrder as string);
    }

    if (models) {
      query.models = JSON.parse(models as string);
    }

    if (brands) {
      query.brands = JSON.parse(brands as string);
    }

    return query;
  }
}

export class CreateGroupDTO {
  @IsString()
  @IsDefined()
  name: string;

  @IsOptional()
  quota: number;

  @IsOptional()
  parent?: Types.ObjectId;

  @IsOptional()
  key?: number;
}
