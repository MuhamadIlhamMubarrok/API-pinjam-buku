import {
  FacetPipelineBuilder,
  PipelineBuilder,
  generateArrayFilter,
  generateSearchCondition,
  setDateQuery,
} from 'utils';
import { GetTransactionOptionDTO } from 'src/dto/transaction.dto';

const getTransactionOptionPipeline = (query: GetTransactionOptionDTO) => {
  const {
    search,
    status,
    group,
    user,
    manager,
    requestDate,
    lastUpdate,
    userOptions,
    groupOptions,
    statusOptions,
    managerOptions,
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
      status: 1,
      manager: 1,
      group: 1,
      user: '$assignedTo',
    })
    .facet({
      groupOptions: new FacetPipelineBuilder()
        .match({
          group: { $ne: null },
          $expr: { $eq: [groupOptions, true] },
        })
        .group({ _id: { label: '$group.name', value: '$group.key' } })
        .sort({ '_id.label': 1 })
        .build(),
      userOptions: new FacetPipelineBuilder()
        .match({
          user: { $ne: null },
          $expr: { $eq: [userOptions, true] },
        })
        .group({ _id: { label: '$user.fullName', value: '$user.key' } })
        .sort({ '_id.label': 1 })
        .build(),
      managerOptions: new FacetPipelineBuilder()
        .match({
          manager: { $ne: null },
          $expr: { $eq: [managerOptions, true] },
        })
        .group({ _id: { label: '$manager.fullName', value: '$manager.key' } })
        .sort({ '_id.label': 1 })
        .build(),
      statusOptions: new FacetPipelineBuilder()
        .match({
          status: { $ne: null },
          $expr: { $eq: [statusOptions, true] },
        })
        .group({ _id: { label: '$status', value: '$status' } })
        .sort({ '_id.label': 1 })
        .build(),
    })
    .set({
      groupOptions: '$groupOptions._id',
      userOptions: '$userOptions._id',
      statusOptions: '$statusOptions._id',
      managerOptions: '$managerOptions._id',
    })
    .build();
};

export default getTransactionOptionPipeline;
