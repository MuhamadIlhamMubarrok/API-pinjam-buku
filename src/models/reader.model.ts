import { IReader, schemas } from 'schemas';
import * as mongoose from 'mongoose';

export const ReaderSchema = schemas.readerSchema;

export const ReaderModel = mongoose.model<IReader>('readers', ReaderSchema);
