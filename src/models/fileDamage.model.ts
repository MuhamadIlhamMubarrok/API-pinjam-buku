import * as mongoose from 'mongoose';
import { schemas, IFileDamage } from 'schemas';

export const FileDamageSchema = schemas.fileDamageSchema;

export const FileDamageModel = mongoose.model<IFileDamage>(
  'file_damages',
  FileDamageSchema,
);
