import { Injectable, PipeTransform } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

const ValidSereverity = ['info', 'danger', 'warning', 'success'];

export class GetTransactionListDTO {
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
  status?: string | string[];

  @IsOptional()
  group?: string | number[];

  @IsOptional()
  user?: string | number[];

  @IsOptional()
  manager?: string | number[];

  @IsOptional()
  requestDate?: string | number[];

  @IsOptional()
  lastUpdate?: string | number[];
}

@Injectable()
export class GetTransactionListDTOPipe implements PipeTransform {
  transform(query: GetTransactionListDTO): GetTransactionListDTO {
    const {
      page,
      limit,
      sortOrder,
      status,
      group,
      user,
      manager,
      requestDate,
      lastUpdate,
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

    if (status) {
      query.status = JSON.parse(status as string);
    }

    if (group) {
      query.group = JSON.parse(group as string);
    }

    if (user) {
      query.user = JSON.parse(user as string);
    }

    if (manager) {
      query.manager = JSON.parse(manager as string);
    }

    if (requestDate) {
      query.requestDate = JSON.parse(requestDate as string);
    }

    if (lastUpdate) {
      query.lastUpdate = JSON.parse(lastUpdate as string);
    }

    return query;
  }
}

export class GetTransactionOptionDTO extends GetTransactionListDTO {
  @IsOptional()
  statusOptions?: boolean | string;

  @IsOptional()
  userOptions?: boolean | string;

  @IsOptional()
  groupOptions?: boolean | string;

  @IsOptional()
  managerOptions?: boolean | string;
}

@Injectable()
export class GetTransactionOptionsDTOPipe implements PipeTransform {
  transform(query: GetTransactionOptionDTO): GetTransactionListDTO {
    const { userOptions, groupOptions, statusOptions, managerOptions } = query;
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

    if (managerOptions == 'true') {
      query.managerOptions = true;
    } else if (managerOptions == 'false') {
      query.managerOptions = false;
    } else {
      query.managerOptions = undefined;
    }

    if (statusOptions == 'true') {
      query.statusOptions = true;
    } else if (statusOptions == 'false') {
      query.statusOptions = false;
    } else {
      query.statusOptions = undefined;
    }

    return query;
  }
}

export class GetRequestListDTO {
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
  name?: string | number[];

  @IsOptional()
  brand?: string | number[];

  @IsOptional()
  model?: string | number[];

  @IsOptional()
  transactionId?: string;
}

@Injectable()
export class GetRequestListDTOPipe implements PipeTransform {
  transform(query: GetRequestListDTO): GetRequestListDTO {
    const { page, limit, sortOrder, name, brand, model } = query;

    if (limit) {
      query.limit = parseInt(limit as string);
    }

    if (page) {
      query.page = parseInt(page as string);
    }

    if (sortOrder) {
      query.sortOrder = parseInt(sortOrder as string);
    }

    if (name) {
      query.name = JSON.parse(name as string);
    }

    if (brand) {
      query.brand = JSON.parse(brand as string);
    }

    if (model) {
      query.model = JSON.parse(model as string);
    }

    return query;
  }
}

export class GetRequestOptionDTO extends GetRequestListDTO {
  @IsOptional()
  nameOptions?: boolean | string;

  @IsOptional()
  brandOptions?: boolean | string;

  @IsOptional()
  modelOptions?: boolean | string;
}

@Injectable()
export class GetRequestOptionsDTOPipe implements PipeTransform {
  transform(query: GetRequestOptionDTO): GetRequestListDTO {
    const { nameOptions, brandOptions, modelOptions } = query;

    if (nameOptions == 'true') {
      query.nameOptions = true;
    } else if (nameOptions == 'false') {
      query.nameOptions = false;
    } else {
      query.nameOptions = undefined;
    }

    if (brandOptions == 'true') {
      query.brandOptions = true;
    } else if (brandOptions == 'false') {
      query.brandOptions = false;
    } else {
      query.brandOptions = undefined;
    }

    if (modelOptions == 'true') {
      query.modelOptions = true;
    } else if (modelOptions == 'false') {
      query.modelOptions = false;
    } else {
      query.modelOptions = undefined;
    }

    return query;
  }
}

export class CreateTransactionAttributeDTO {
  @ApiProperty({ type: 'string', example: '65ea6fc61f39f83ef63583ed' })
  @IsNotEmpty()
  @IsMongoId()
  _id: string;

  @ApiProperty({ type: 'string', example: 'name A' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ type: 'integer', example: 3 })
  @IsNotEmpty()
  key: number;
}

export class ReportRequestDTO {
  @ApiPropertyOptional({ type: 'string', example: 'this is note' })
  @IsOptional()
  note?: string;
}

export class ArrayOfIdDTO {
  @ApiProperty({
    type: 'array',
    items: {
      type: 'string',
      example: '65ea7d29f5cd331b5beed2b1',
    },
  })
  @IsArray()
  @IsNotEmpty()
  @ArrayMinSize(1)
  id: string[];
}

export class UpdateApprovalStatusDTO {
  @ApiProperty({ type: 'boolean', example: true })
  @IsNotEmpty()
  isApproved: boolean;

  @ApiProperty({ type: 'string', example: '6603e10ad07e13b634630f29' })
  @IsNotEmpty()
  @IsMongoId()
  id: string;

  @ApiPropertyOptional({ type: 'string', example: 'this is notes' })
  @IsOptional()
  notes?: string;
}

export class CreateNotificationDTO {
  @IsNotEmpty()
  user: string;
  @IsNotEmpty()
  title: string;
  @IsNotEmpty()
  detail: string;
  @IsOptional()
  isRead?: boolean = false;
  @IsNotEmpty()
  isReadOnly: boolean;
  @IsNotEmpty()
  isManager: boolean;
  module?: any;
  status?: any;
  @IsNotEmpty()
  @IsIn(ValidSereverity)
  severity: string;
  type?: string;
  data?: any;
}

export class CreateTransactionUserDTO {
  @ApiProperty({ type: 'string', example: '65ea7d29f5cd331b5beed2b1' })
  @IsNotEmpty()
  @IsMongoId()
  _id: string;

  @ApiProperty({ type: 'string', example: 'full name' })
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ type: 'integer', example: 4 })
  @IsNotEmpty()
  key: number;
}

export class CreateTransactionAssetNameDTO {
  @ApiProperty({ type: 'string', example: '65ea7d29f5cd331b5beed2b1' })
  @IsNotEmpty()
  @IsMongoId()
  _id: string;

  @ApiProperty({ type: 'string', example: 'name - 1' })
  @IsNotEmpty()
  nameWithSequence: string;

  @ApiProperty({ type: 'integer', example: 1 })
  @IsNotEmpty()
  key: number;
}

export class CreateTransactionDTO {
  @ApiProperty({ type: 'string', example: '65ea7d29f5cd331b5beed2b1' })
  @IsNotEmpty()
  @IsString()
  asset: string;

  @ApiProperty({ type: CreateTransactionAssetNameDTO })
  @IsNotEmpty()
  assetName: CreateTransactionAssetNameDTO;

  @ApiProperty({ type: CreateTransactionAttributeDTO })
  @IsNotEmpty()
  assetBrand: CreateTransactionAttributeDTO;

  @ApiProperty({ type: CreateTransactionAttributeDTO })
  @IsNotEmpty()
  assetModel: CreateTransactionAttributeDTO;

  @ApiProperty({ type: CreateTransactionAttributeDTO })
  @IsNotEmpty()
  assetGroup: CreateTransactionAttributeDTO;

  @ApiProperty({ type: CreateTransactionUserDTO })
  @IsNotEmpty()
  user: CreateTransactionUserDTO;
}

export class UpdateTransactionUser {
  @ApiProperty({ type: String, example: '65ea6fc61f39f83ef63583ed' })
  @IsNotEmpty()
  @IsMongoId()
  user: string;
}
