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
  @IsNotEmpty()
  isApproved: boolean;

  @IsNotEmpty()
  @IsMongoId()
  id: string;

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
