import * as mongoose from 'mongoose';
import { schemas, IGroup } from 'schemas';

export const GroupSchema = schemas.groupSchema;

export const GroupModel = mongoose.model<IGroup>('groups', GroupSchema);
