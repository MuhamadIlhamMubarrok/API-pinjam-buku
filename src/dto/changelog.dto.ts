import { IsOptional } from 'class-validator';
import { Types } from 'mongoose';

export class CreateChangelogDTO {
  @IsOptional()
  object?: string;
  @IsOptional()
  objectId?: string | Types.ObjectId;
  @IsOptional()
  action?: string;
  @IsOptional()
  name?: string;
  @IsOptional()
  field?: string;
  @IsOptional()
  oldValue?: string;
  @IsOptional()
  objectName?: string;
  @IsOptional()
  newValue?: string;
  @IsOptional()
  modifiedBy?: string;
}
