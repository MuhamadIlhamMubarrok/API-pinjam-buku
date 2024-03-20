import * as mongoose from 'mongoose';
import { schemas, ITransactionLog } from 'schemas';

export const TransactionLogSchema = schemas.transactionLogSchema;

export const TransactionLogModel = mongoose.model<ITransactionLog>(
  'transaction_log',
  TransactionLogSchema,
);
