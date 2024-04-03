import { Injectable, PipeTransform } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsMongoId, IsNotEmpty, IsOptional } from 'class-validator';
import { Types } from 'mongoose';

export class CreatePrelistDTO {
  @ApiProperty({ type: [String], example: ['65ea6fc61f39f83ef63583ed'] })
  @IsNotEmpty()
  @IsArray()
  id: string[] | Types.ObjectId[];

  @ApiProperty({ type: String, example: '645e40976274c7513437248a' })
  @IsNotEmpty()
  @IsMongoId()
  user: string;
}

export class GetPrelistDTO {
  @IsOptional()
  search?: string;

  @IsOptional()
  page?: string | number;

  @IsOptional()
  limit?: string | number;

  @IsOptional()
  sortBy?: string;

  @IsOptional()
  sortOrder?: string | number;

  @IsOptional()
  group?: number[] | string;

  @IsOptional()
  user?: number[] | string;

  @IsOptional()
  tagId?: string;

  @IsOptional()
  prelistId?: Types.ObjectId;
}

@Injectable()
export class GetPrelistDTOPipe implements PipeTransform {
  transform(query: GetPrelistDTO): GetPrelistDTO {
    const { page, limit, sortOrder, group, user } = query;

    if (limit) {
      query.limit = parseInt(limit as string);
    }

    if (page) {
      query.page = parseInt(page as string);
    }

    if (sortOrder) {
      query.sortOrder = parseInt(sortOrder as string);
    }

    if (group) {
      query.group = JSON.parse(group as string);
    }

    if (user) {
      query.user = JSON.parse(user as string);
    }

    return query;
  }
}

export class GetPrelistRequestDTO {
  @IsOptional()
  search?: string;

  @IsOptional()
  page?: string | number;

  @IsOptional()
  limit?: string | number;

  @IsOptional()
  sortBy?: string;

  @IsOptional()
  sortOrder?: string | number;

  @IsOptional()
  asset?: number[] | string;

  @IsOptional()
  brand?: number[] | string;

  @IsOptional()
  model?: number[] | string;

  @IsOptional()
  group?: number[] | string;

  @IsOptional()
  tag?: string[] | string;
}

@Injectable()
export class GetPrelistRequestDTOPipe implements PipeTransform {
  transform(query: GetPrelistRequestDTO): GetPrelistRequestDTO {
    const { page, limit, sortOrder, asset, brand, model, tag, group } = query;

    if (limit) {
      query.limit = parseInt(limit as string);
    }

    if (page) {
      query.page = parseInt(page as string);
    }

    if (sortOrder) {
      query.sortOrder = parseInt(sortOrder as string);
    }

    if (asset) {
      query.asset = JSON.parse(asset as string);
    }

    if (brand) {
      query.brand = JSON.parse(brand as string);
    }

    if (model) {
      query.model = JSON.parse(model as string);
    }

    if (tag) {
      query.tag = JSON.parse(tag as string);
    }

    if (group) {
      query.group = JSON.parse(group as string);
    }

    return query;
  }
}

export class GetPrelistOptionDTO extends GetPrelistDTO {
  @IsOptional()
  userOptions?: boolean | string;

  @IsOptional()
  groupOptions?: boolean | string;
}

@Injectable()
export class GetPrelistOptionsDTOPipe implements PipeTransform {
  transform(query: GetPrelistOptionDTO): GetPrelistDTO {
    const { userOptions, groupOptions } = query;

    if (groupOptions == 'true') {
      query.groupOptions = true;
    } else if (groupOptions == 'false') {
      query.groupOptions = false;
    } else {
      query.groupOptions = undefined;
    }

    if (userOptions == 'true') {
      query.userOptions = true;
    } else if (userOptions == 'false') {
      query.userOptions = false;
    } else {
      query.userOptions = undefined;
    }

    return query;
  }
}

export class GetPrelistRequestOptionDTO extends GetPrelistRequestDTO {
  @IsOptional()
  assetOptions?: boolean | string;

  @IsOptional()
  brandOptions?: boolean | string;

  @IsOptional()
  modelOptions?: boolean | string;

  @IsOptional()
  tagOptions?: boolean | string;

  @IsOptional()
  groupOptions?: boolean | string;
}

@Injectable()
export class GetPrelistRequestOptionsDTOPipe implements PipeTransform {
  transform(query: GetPrelistRequestOptionDTO): GetPrelistRequestDTO {
    const {
      assetOptions,
      brandOptions,
      modelOptions,
      tagOptions,
      groupOptions,
    } = query;

    if (tagOptions == 'true') {
      query.tagOptions = true;
    } else if (tagOptions == 'false') {
      query.tagOptions = false;
    } else {
      query.tagOptions = undefined;
    }

    if (modelOptions == 'true') {
      query.modelOptions = true;
    } else if (modelOptions == 'false') {
      query.modelOptions = false;
    } else {
      query.modelOptions = undefined;
    }

    if (brandOptions == 'true') {
      query.brandOptions = true;
    } else if (brandOptions == 'false') {
      query.brandOptions = false;
    } else {
      query.brandOptions = undefined;
    }

    if (groupOptions == 'true') {
      query.groupOptions = true;
    } else if (groupOptions == 'false') {
      query.groupOptions = false;
    } else {
      query.groupOptions = undefined;
    }

    if (assetOptions == 'true') {
      query.assetOptions = true;
    } else if (assetOptions == 'false') {
      query.assetOptions = false;
    } else {
      query.assetOptions = undefined;
    }

    return query;
  }
}

export class UpdatePrelistRequestDTO {
  @ApiProperty({ type: String, example: '645e40976274c7513437248a' })
  @IsOptional()
  @IsMongoId()
  assignedTo?: string;
}
