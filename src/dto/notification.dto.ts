import { IsIn, IsNotEmpty, IsOptional } from 'class-validator';

const ValidSereverity = ['info', 'danger', 'warning', 'success'];

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
