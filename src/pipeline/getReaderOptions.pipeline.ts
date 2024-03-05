import { GetReaderOptionsDTO } from 'src/dto/reader.dto';
import {
  FacetPipelineBuilder,
  PipelineBuilder,
  generateArrayFilter,
  generateSearchCondition,
} from 'utils';

const getReaderOptionsPipeline = (query: GetReaderOptionsDTO) => {
  const {
    deviceNameOptions,
    groupOptions,
    page,
    limit,
    search,
    sortBy,
    sortOrder,
    deviceName,
    status,
    group,
  } = query;

  return new PipelineBuilder()
    .match({
      'name.name': generateArrayFilter(deviceName as string[]),
      status: generateArrayFilter(status as string[]),
      'group.name': generateArrayFilter(group as string[]),
    })
    .match({
      $or: [
        { 'name.name': generateSearchCondition(search) },
        { status: generateSearchCondition(search) },
        { 'group.name': generateSearchCondition(search) },
      ],
    })
    .project({
      _id: 1,
      imageBig: 1,
      imageSmall: 1,
      name: '$name.name',
      group: '$group.name',
      status: 1,
    })
    .facet({
      deviceNameOptions: new FacetPipelineBuilder()
        .match({
          name: { $ne: null },
          $expr: { $eq: [deviceNameOptions, true] },
        })
        .group({ _id: { label: '$name', value: '$name' } })
        .sort({ '_id.label': 1 })
        .build(),
      groupOptions: new FacetPipelineBuilder()
        .match({
          group: { $ne: null },
          $expr: { $eq: [groupOptions, true] },
        })
        .group({ _id: { label: '$group', value: '$group' } })
        .sort({ '_id.label': 1 })
        .build(),
    })
    .set({
      deviceNameOptions: '$deviceNameOptions._id',
      groupOptions: '$groupOptions._id',
    })
    .build();
};

export default getReaderOptionsPipeline;
