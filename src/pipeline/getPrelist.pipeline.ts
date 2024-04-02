import {
  FacetPipelineBuilder,
  PipelineBuilder,
  generateArrayFilter,
  generateSearchCondition,
} from 'utils';
import { GetPrelistDTO } from 'src/dto/prelist.dto';

const getPrelistPipeline = (query: GetPrelistDTO) => {
  const { search, page, limit, sortBy, sortOrder, group, user, prelistId } =
    query;

  return new PipelineBuilder()
    .match({
      _id: prelistId || { $ne: 'g#*a,Jvb&U.Bg' },
      'group.key': generateArrayFilter(group as number[]),
      'assignedTo.key': generateArrayFilter(user as number[]),
    })
    .match({
      $or: [
        { 'manager.fullName': generateSearchCondition(search) },
        { 'group.name': generateSearchCondition(search) },
        { 'assignedTo.fullName': generateSearchCondition(search) },
      ],
    })
    .project({
      user: '$assignedTo.fullName',
      group: '$group.name',
      totalAssets: 1,
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

export default getPrelistPipeline;
