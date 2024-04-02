import * as mongoose from 'mongoose';
import { schemas, IAssignmentPrelist } from 'schemas';

export const AssignmentPrelistSchema = schemas.assignmentPrelistSchema;

export const AssignmentPrelistModel = mongoose.model<IAssignmentPrelist>(
  'assignment_prelist',
  AssignmentPrelistSchema,
);
