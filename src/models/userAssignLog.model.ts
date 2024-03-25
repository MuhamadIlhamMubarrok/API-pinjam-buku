import * as mongoose from 'mongoose';
import { schemas, IUser } from 'schemas';
import { IUserAssignmentLog } from 'schemas/interfaces/company/log/userAssignmentLog.interface';

export const UserAssignmentLogSchema = schemas.userAssignmentLogSchema;

export const UserAssignmentLogModel = mongoose.model<IUserAssignmentLog>(
  'user_assignment_log',
  UserAssignmentLogSchema,
);
