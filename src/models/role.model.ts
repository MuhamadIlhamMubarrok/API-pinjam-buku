import * as mongoose from 'mongoose';
import { schemas, IRole } from 'schemas';

export const RoleSchema = schemas.roleSchema;

export const RoleModel = mongoose.model<IRole>('role', RoleSchema, 'roles');
