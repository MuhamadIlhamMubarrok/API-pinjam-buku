import { Injectable, PipeTransform } from '@nestjs/common';
import { IsString, IsDefined, IsOptional } from 'class-validator';
import { Types } from 'mongoose';
import { parseAndAssign } from '../utils/test.utils';

export class GetRolesDTO {
  @IsOptional()
  search?: string;

  @IsOptional()
  page?: string | number;

  @IsOptional()
  limit?: string | number;

  @IsOptional()
  groups?: number[] | string;

  @IsOptional()
  isActive?: boolean[] | string;

  @IsOptional()
  sortBy?: string;

  @IsOptional()
  sortOrder?: string | number;
}

@Injectable()
export class GetRolesDTOPipe implements PipeTransform {
  transform(query: GetRolesDTO): GetRolesDTO {
    const { limit, page, sortOrder, groups, isActive } = query;

    parseAndAssign(query, 'limit', limit, 'intParse');
    parseAndAssign(query, 'page', page, 'intParse');

    if (sortOrder) {
      query.sortOrder = parseInt(sortOrder as string);
    }

    if (groups) {
      query.groups = JSON.parse(groups as string);
    }

    if (isActive) {
      query.isActive = JSON.parse(isActive as string);
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
