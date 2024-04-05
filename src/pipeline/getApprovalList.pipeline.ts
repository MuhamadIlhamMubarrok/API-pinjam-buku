import {
  FacetPipelineBuilder,
  PipelineBuilder,
  generateArrayFilter,
  generateSearchCondition,
  setDateQuery,
} from 'utils';
import { Types } from 'mongoose';
import { GetApprovalListDTO } from 'src/dto/approval.dto';

const getApprovalListPipeline = (query: GetApprovalListDTO) => {
  const {
    search,
    page,
    limit,
    sortBy,
    sortOrder,
    status,
    group,
    user,
    loggedInUser,
    manager,
    lastUpdate,
  } = query;

  return new PipelineBuilder()
    .match({
      status: generateArrayFilter(status as string[]),
      'group.key': generateArrayFilter(group as number[]),
      'assignedTo.key': generateArrayFilter(user as number[]),
      'manager.key': generateArrayFilter(manager as number[]),
      'user._id': new Types.ObjectId(loggedInUser),
      updatedAt: lastUpdate
        ? setDateQuery(lastUpdate as number[])
        : { $ne: "'g#*a,Jvb&U.Bg'" },
    })
    .match({
      $or: [
        { 'user.fullName': generateSearchCondition(search) },
        { transactionId: generateSearchCondition(search) },
        { 'manager.fullName': generateSearchCondition(search) },
        { 'group.name': generateSearchCondition(search) },
        { 'assignedTo.fullName': generateSearchCondition(search) },
        { status: generateSearchCondition(search) },
      ],
    })
    .group({
      _id: '$transactionId',
      status: { $first: '$status' },
      group: { $first: '$group.name' },
      user: { $first: '$assignedTo.fullName' },
      manager: { $first: '$manager.fullName' },
      totalAsset: { $count: {} },
      lastUpdate: { $max: '$updatedAt' },
    })
    .facet({
      totalRecords: [{ $count: 'total' }],
      data: new FacetPipelineBuilder()
        .sort(
          (sortBy && sortOrder && ({ [sortBy]: sortOrder } as any)) || {
            transactionId: -1,
          },
        )
        .skip(
          (page && limit && ((page as number) - 1) * (limit as number)) || 0,
        )
        .limit(limit)
        .build(),
    })
    .unwind('$totalRecords')
    .set({ totalRecords: '$totalRecords.total' })
    .build();
};

export default getApprovalListPipeline;
