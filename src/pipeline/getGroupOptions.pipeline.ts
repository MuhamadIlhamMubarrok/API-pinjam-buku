import { GetGroupOptionsDTO } from 'src/dto/group.dto';
import {
  FacetPipelineBuilder,
  PipelineBuilder,
  generateArrayFilter,
  generateSearchCondition,
} from 'utils';

const getGroupOptionsPipeline = (query: GetGroupOptionsDTO) => {
  const { search, groups, groupOptions } = query;

  return new PipelineBuilder()
    .match({
      isDeleted: false,
    })
    .project({
      name: 1,
      key: 1,
    })
    .match({
      'brands.key': generateArrayFilter(groups as number[]),
    })
    .match({
      $or: [{ name: generateSearchCondition(search) }],
    })
    .facet({
      groupOptions: new FacetPipelineBuilder()
        .match({
          name: { $ne: null },
          $expr: { $eq: [groupOptions, true] },
        })
        .group({ _id: { label: '$name', value: '$key' } })
        .sort({ '_id.label': 1 })
        .build(),
    })
    .set({
      groupOptions: '$groupOptions._id',
    })
    .build();
};

export default getGroupOptionsPipeline;
