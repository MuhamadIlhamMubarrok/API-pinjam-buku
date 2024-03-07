import * as mongoose from 'mongoose';
import { schemas, IUser } from 'schemas';

export const UserSchema = schemas.userSchema;

export const UserModel = mongoose.model<IUser>('user', UserSchema);
