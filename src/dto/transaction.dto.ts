import {
  IsArray,
  IsIn,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

const ValidSereverity = ['info', 'danger', 'warning', 'success'];

export class CreateTransactionAttributeDTO {
  @IsNotEmpty()
  @IsMongoId()
  _id: string;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  key: number;
}

export class ReportRequestDTO {
  @IsOptional()
  note?: string;
}

export class ArrayOfIdDTO {
  @IsArray()
  id: string[];
}

export class UpdateApprovalStatusDTO {
  @IsNotEmpty()
  isApproved: boolean;

  @IsNotEmpty()
  @IsMongoId()
  id: string;
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
  @IsNotEmpty()
  @IsMongoId()
  _id: string;

  @IsNotEmpty()
  fullName: string;

  @IsNotEmpty()
  key: number;
}

export class CreateTransactionAssetNameDTO {
  @IsNotEmpty()
  @IsMongoId()
  _id: string;

  @IsNotEmpty()
  nameWithSequence: string;

  @IsNotEmpty()
  key: number;
}

export class CreateTransactionDTO {
  @IsNotEmpty()
  @IsString()
  asset: string;

  @IsNotEmpty()
  assetName: CreateTransactionAssetNameDTO;

  @IsNotEmpty()
  assetBrand: CreateTransactionAttributeDTO;

  @IsNotEmpty()
  assetModel: CreateTransactionAttributeDTO;

  @IsNotEmpty()
  assetGroup: CreateTransactionAttributeDTO;

  @IsNotEmpty()
  user: CreateTransactionUserDTO;
}
