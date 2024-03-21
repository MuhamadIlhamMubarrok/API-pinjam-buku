import * as mongoose from 'mongoose';
import { schemas, IAsset } from 'schemas';

export const AssetSchema = schemas.assetSchema;

export const AssetModel = mongoose.model<IAsset>('change_logs', AssetSchema);
