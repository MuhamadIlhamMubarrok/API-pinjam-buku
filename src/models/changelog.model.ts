import * as mongoose from 'mongoose';
import { schemas, IChangelog } from 'schemas';

export const ChangelogSchema = schemas.changelogSchema;

export const ChangelogModel = mongoose.model<IChangelog>(
  'change_logs',
  ChangelogSchema,
);
