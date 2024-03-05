import { GetReaderDTO } from 'src/dto/reader.dto';
import {
  FacetPipelineBuilder,
  PipelineBuilder,
  generateArrayFilter,
  generateSearchCondition,
} from 'utils';

const getReaderListPipeline = (query: GetReaderDTO) => {
  const { page, limit, search, sortBy, sortOrder, deviceName, status, group } =
    query;

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
      totalRecords: [{ $count: 'totalRecords' }],
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
    .set({
      totalRecords: '$totalRecords.totalRecords',
    })
    .build();
};

export default getReaderListPipeline;
