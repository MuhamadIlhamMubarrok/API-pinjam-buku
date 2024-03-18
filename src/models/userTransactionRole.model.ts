import * as mongoose from 'mongoose';
import { IUserTransactionRole, schemas } from 'schemas';

export const UserTransactionRoleSchema = schemas.userTransactionRoleSchema;

export const UserTransactionRoleModel = mongoose.model<IUserTransactionRole>(
  'user_transaction_role',
  UserTransactionRoleSchema,
);
