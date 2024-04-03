import {
  FacetPipelineBuilder,
  PipelineBuilder,
  generateArrayFilter,
  generateSearchCondition,
  setDateQuery,
} from 'utils';
import { GetTransactionListDTO } from 'src/dto/transaction.dto';

const getTransactionListPipeline = (query: GetTransactionListDTO) => {
  const {
    search,
    page,
    limit,
    sortBy,
    sortOrder,
    status,
    group,
    user,
    manager,
    requestDate,
    lastUpdate,
  } = query;

  return new PipelineBuilder()
    .match({
      status: generateArrayFilter(status as string[]),
      'group.key': generateArrayFilter(group as number[]),
      'assignedTo.key': generateArrayFilter(user as number[]),
      'manager.key': generateArrayFilter(manager as number[]),
      assignDate: requestDate
        ? setDateQuery(requestDate as number[])
        : { $ne: "'g#*a,Jvb&U.Bg'" },
      updatedAt: lastUpdate
        ? setDateQuery(lastUpdate as number[])
        : { $ne: "'g#*a,Jvb&U.Bg'" },
    })
    .match({
      $or: [
        { transactionId: generateSearchCondition(search) },
        { 'manager.fullName': generateSearchCondition(search) },
        { 'group.name': generateSearchCondition(search) },
        { 'assignedTo.fullName': generateSearchCondition(search) },
        { status: generateSearchCondition(search) },
      ],
    })
    .project({
      transactionId: 1,
      status: 1,
      group: '$group.name',
      user: '$assignedTo.fullName',
      manager: '$manager.fullName',
      totalAssets: 1,
      requestDate: '$assignDate',
      lastUpdate: '$updatedAt',
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

export default getTransactionListPipeline;
