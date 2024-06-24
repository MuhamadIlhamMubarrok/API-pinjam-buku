import * as mongoose from 'mongoose';
import { schemas, IMember } from 'schemas';

export const MemberSchema = schemas.memberSchema;

export const memberModel = mongoose.model<IMember>('member', MemberSchema);
