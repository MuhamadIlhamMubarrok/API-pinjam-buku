import { GetRolesDTO } from 'src/dto/role.dto';
import {
  FacetPipelineBuilder,
  PipelineBuilder,
  generateArrayFilter,
  generateSearchCondition,
} from 'utils';

const getGroupListPipeline = (query: GetRolesDTO) => {
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
      brandOptions: new FacetPipelineBuilder()
        .unwind('$brands')
        .group({ _id: { label: '$brands.name', value: '$brands.key' } })
        .match({ '_id.label': { $nin: [null, ''] } })
        .sort({ '_id.label': 1 })
        .build(),
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
      modelOptions: '$modelOptions._id',
      brandOptions: '$brandOptions._id',
    })
    .build();
};

export default getGroupListPipeline;
