import { Injectable, PipeTransform } from '@nestjs/common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsDefined, IsOptional } from 'class-validator';
import { Types } from 'mongoose';

export class GetGroupDTO {
  @ApiPropertyOptional({ type: 'string', example: 'username_1' })
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ type: 'number', example: 1 })
  @IsOptional()
  page?: string | number;

  @ApiPropertyOptional({ type: 'number', example: 1 })
  @IsOptional()
  limit?: string | number;

  @ApiPropertyOptional({ type: 'string', example: '[1]' })
  @IsOptional()
  groups?: number[] | string;

  @ApiPropertyOptional({ type: 'string', example: '[false]' })
  @IsOptional()
  isActive?: boolean[] | string;

  @ApiPropertyOptional({ type: 'string', example: 'group' })
  @IsOptional()
  sortBy?: string;

  @ApiPropertyOptional({ type: 'number', example: 1 })
  @IsOptional()
  sortOrder?: string | number;
}
export class GetGroupOptionsDTO extends GetGroupDTO {
  @ApiPropertyOptional({ type: 'boolean', example: true })
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
  @ApiPropertyOptional({ type: 'string', example: '[1]' })
  @IsString()
  @IsDefined()
  name: string;

  @ApiPropertyOptional({ type: 'number', example: 1 })
  @IsOptional()
  quota: number;

  @ApiPropertyOptional({ type: 'string', example: '65f9344de4f427fe9c7f064b' })
  @IsOptional()
  parent?: Types.ObjectId;
}
