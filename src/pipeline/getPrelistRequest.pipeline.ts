import {
  FacetPipelineBuilder,
  PipelineBuilder,
  generateArrayFilter,
  generateSearchCondition,
} from 'utils';
import { Types } from 'mongoose';
import { GetPrelistRequestDTO } from 'src/dto/prelist.dto';

const getPrelistRequestPipeline = (query: GetPrelistRequestDTO, id: string) => {
  const {
    search,
    page,
    limit,
    sortBy,
    sortOrder,
    asset,
    brand,
    model,
    tag,
    group,
  } = query;

  return new PipelineBuilder()
    .match({
      'assetName.key': generateArrayFilter(asset as number[]),
      'assetBrand.key': generateArrayFilter(brand as number[]),
      'assetModel.key': generateArrayFilter(model as number[]),
      'assetGroup.key': generateArrayFilter(group as number[]),
      assetTagType: generateArrayFilter(tag as string[]),
      prelist: id ? new Types.ObjectId(id) : { $ne: 'g#*a,Jvb&U.Bg' },
    })
    .match({
      $or: [
        { 'assetName.nameWithSequence': generateSearchCondition(search) },
        { 'assetBrand.name': generateSearchCondition(search) },
        { 'assetModel.name': generateSearchCondition(search) },
        { 'assetGroup.name': generateSearchCondition(search) },
        { assetTagType: generateSearchCondition(search) },
      ],
    })
    .project({
      assetImageBig: 1,
      assetImageMedium: 1,
      assetImageSmall: 1,
      name: '$assetName.nameWithSequence',
      brand: '$assetBrand.name',
      model: '$assetModel.name',
      assetQr: 1,
      assetRfid: 1,
      group: '$assetGroup.name',
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

export default getPrelistRequestPipeline;
