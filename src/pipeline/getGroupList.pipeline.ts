import { GetGroupDTO } from 'src/dto/group.dto';
import {
  FacetPipelineBuilder,
  PipelineBuilder,
  generateArrayFilter,
  generateSearchCondition,
} from 'utils';

const getGroupListPipeline = (query: GetGroupDTO) => {
  const { page, limit, search, sortBy, sortOrder, groups } = query;
  return new PipelineBuilder()
    .match({
      isDeleted: false,
    })
    .project({
      name: 1,
      category: {
        _id: 1,
        name: 1,
        key: 1,
      },
      brands: {
        _id: 1,
        name: 1,
        key: 1,
      },
      models: {
        _id: 1,
        name: 1,
        key: 1,
      },
      key: 1,
    })
    .match({
      'brands.key': generateArrayFilter(groups as number[]),
    })
    .match({
      $or: [{ name: generateSearchCondition(search) }],
    })
    .facet({
      total: [{ $count: 'total' }],

      groups: new FacetPipelineBuilder()
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
    .unwind('$total')
    .set({
      total: '$total.total',
    })
    .build();
};

export default getGroupListPipeline;
