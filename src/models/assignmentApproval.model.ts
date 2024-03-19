import * as mongoose from 'mongoose';
import { schemas, IAssignmentApproval } from 'schemas';

export const AssignmentApprovalSchema = schemas.assignmentApprovalSchema;

export const AssignmentApprovalModel = mongoose.model<IAssignmentApproval>(
  'assignment_approval',
  AssignmentApprovalSchema,
);
