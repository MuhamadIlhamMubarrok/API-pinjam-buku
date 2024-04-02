import {
  FacetPipelineBuilder,
  PipelineBuilder,
  generateArrayFilter,
  generateSearchCondition,
} from 'utils';
import { GetPrelistOptionDTO } from 'src/dto/prelist.dto';

const getPrelistOptionPipeline = (query: GetPrelistOptionDTO) => {
  const { search, group, user, groupOptions, userOptions } = query;

  return new PipelineBuilder()
    .match({
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
      user: '$assignedTo',
      group: '$group',
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
    })
    .set({
      groupOptions: '$groupOptions._id',
      userOptions: '$userOptions._id',
    })
    .build();
};

export default getPrelistOptionPipeline;
