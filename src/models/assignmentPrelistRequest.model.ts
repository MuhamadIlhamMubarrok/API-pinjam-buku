import * as mongoose from 'mongoose';
import { schemas, IAssignmentPrelistRequest } from 'schemas';

export const AssignmentPrelistRequestSchema =
  schemas.assignmentPrelistRequestSchema;

export const AssignmentPrelistRequestModel =
  mongoose.model<IAssignmentPrelistRequest>(
    'assignment_prelist_request',
    AssignmentPrelistRequestSchema,
  );
