import {
  FacetPipelineBuilder,
  PipelineBuilder,
  generateArrayFilter,
  generateSearchCondition,
  setDateQuery,
} from 'utils';
import { GetRequestListDTO } from 'src/dto/transaction.dto';

const getRequestPerTransactionPipeline = (query: GetRequestListDTO) => {
  const {
    search,
    page,
    limit,
    sortBy,
    sortOrder,
    status,
    name,
    group,
    user,
    manager,
    lastUpdate,
  } = query;

  return new PipelineBuilder()
    .match({
      status: generateArrayFilter(status as string[]),
      'assetName.key': generateArrayFilter(name as number[]),
      'manager.key': generateArrayFilter(manager as number[]),
      'group.key': generateArrayFilter(group as number[]),
      'assignedTo.key': generateArrayFilter(user as number[]),
      updatedAt: lastUpdate
        ? setDateQuery(lastUpdate as number[])
        : { $ne: "'g#*a,Jvb&U.Bg'" },
    })
    .match({
      $or: [
        { 'assetName.nameWithSequence': generateSearchCondition(search) },
        { 'assetName.name': generateSearchCondition(search) },
        { status: generateSearchCondition(search) },
        { 'manager.fullName': generateSearchCondition(search) },
        { 'group.name': generateSearchCondition(search) },
        { 'assignedTo.fullName': generateSearchCondition(search) },
      ],
    })
    .group({
      _id: {
        _id: '$transaction',
        transactionId: '$transactionId',
        status: '$status',
      },
      transactionId: { $first: '$transactionId' },
      status: { $first: '$status' },
      user: { $first: '$assignedTo.fullName' },
      manager: { $first: '$manager.fullName' },
      totalAsset: { $count: {} },
      lastUpdate: { $max: '$updatedAt' },
    })
    .addFields({
      _id: '$_id._id',
    })
    .facet({
      totalRecords: [{ $count: 'total' }],
      data: new FacetPipelineBuilder()
        .sort(
          (sortBy && sortOrder && ({ [sortBy]: sortOrder } as any)) || {
            updatedAt: -1,
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

export default getRequestPerTransactionPipeline;
