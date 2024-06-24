import * as mongoose from 'mongoose';
import { schemas, IBooks } from 'schemas';

export const BooksSchema = schemas.booksSchema;

export const booksModel = mongoose.model<IBooks>('book', BooksSchema);
