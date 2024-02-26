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
  groups?: number[] | string;

  @IsOptional()
  isActive?: boolean[] | string;

  @IsOptional()
  sortBy?: string;

  @IsOptional()
  sortOrder?: string | number;
}
export class GetGroupOptionsDTO extends GetGroupDTO {
  @IsOptional()
  groupOptions?: string | boolean;
}

export class GetGroupOptionsDTOPipe implements PipeTransform {
  transform(query: GetGroupOptionsDTO): GetGroupDTO {
    const { groups, groupOptions } = query;

    if (groupOptions) {
      if (groupOptions == 'true') {
        query.groupOptions = true;
      } else if (groupOptions == 'false') {
        query.groupOptions = false;
      } else {
        query.groupOptions = undefined;
      }
    }
    if (groups) {
      query.groups = JSON.parse(groups as string);
    }

    return query;
  }
}

@Injectable()
export class GetGroupDTOPipe implements PipeTransform {
  transform(query: GetGroupDTO): GetGroupDTO {
    const { limit, page, sortOrder, groups, isActive } = query;

    if (limit) {
      query.limit = parseInt(limit as string);
    }

    if (page) {
      query.page = parseInt(page as string);
    }

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
}
