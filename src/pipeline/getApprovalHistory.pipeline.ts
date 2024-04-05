import { PipelineBuilder } from 'utils';
import * as mongoose from 'mongoose';

export const getApprovalHistoryPipeline = (transaction: string) => {
  const transactionId = new mongoose.Types.ObjectId(transaction);
  return new PipelineBuilder()
    .match({
      transaction: transactionId,
    })
    .project({
      user: 1,
      level: 1,
      status: 1,
      isApproved: 1,
      createdAt: 1,
      // isDone: 1,
      type: 1,
      transaction: 1,
    })
    .sort({ isApproved: -1, status: -1 })
    .group({
      _id: '$user',
      level: { $first: '$level' },
      isApproved: { $first: '$isApproved' },
      updatedAt: { $first: '$updatedAt' },
      type: { $first: '$type' },
      transaction: { $first: '$transaction' },
      status: { $first: '$status' },
    })
    .group({
      _id: '$level',
      approvers: {
        $addToSet: {
          user: '$_id',
          approvedAt: {
            $cond: [
              { $ne: ['$status', 'Finished Approval'] },
              null,
              '$updatedAt',
            ],
          },
          status: '$status',
        },
      },
      level: { $first: '$level' },
      type: { $first: '$type' },
      transaction: { $first: '$transaction' },
    })
    .addFields({
      isDone: {
        $allElementsTrue: {
          $map: {
            input: '$approvers',
            as: 'approve',
            in: { $eq: ['$$approve.status', 'Finished Approval'] },
          },
        },
      },
    })
    .addFields({
      approvers: {
        $map: {
          input: '$approvers',
          as: 'item',
          in: {
            $mergeObjects: [
              '$$item',
              {
                isNotInvolved: {
                  $and: [{ $eq: ['$$item.approvedAt', null] }, '$isDone'],
                },
              },
            ],
          },
        },
      },
    })
    .build();
};
