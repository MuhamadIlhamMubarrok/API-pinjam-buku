import {
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

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
