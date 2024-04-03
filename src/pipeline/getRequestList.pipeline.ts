import {
  FacetPipelineBuilder,
  PipelineBuilder,
  generateArrayFilter,
  generateSearchCondition,
} from 'utils';
import { GetRequestListDTO } from 'src/dto/transaction.dto';
import { Types } from 'mongoose';

const getRequestListPipeline = (query: GetRequestListDTO) => {
  const {
    search,
    page,
    limit,
    sortBy,
    sortOrder,
    name,
    brand,
    model,
    transactionId,
  } = query;

  return new PipelineBuilder()
    .match({
      'assetName.key': generateArrayFilter(name as number[]),
      'assetBrand.key': generateArrayFilter(brand as number[]),
      'assetModel.key': generateArrayFilter(model as number[]),
      transaction: transactionId
        ? new Types.ObjectId(transactionId)
        : { $ne: 'g#*a,Jvb&U.Bg' },
    })
    .match({
      $or: [
        { 'assetName.nameWithSequence': generateSearchCondition(search) },
        { 'assetName.name': generateSearchCondition(search) },
        { 'assetBrand.name': generateSearchCondition(search) },
        { 'assetModel.name': generateSearchCondition(search) },
        { status: generateSearchCondition(search) },
        { assetTagType: generateSearchCondition(search) },
        { deviceName: generateSearchCondition(search) },
      ],
    })
    .project({
      assetImageSmall: 1,
      assetImageBig: 1,
      name: '$assetName.nameWithSequence',
      brand: '$assetBrand.name',
      model: '$assetModel.name',
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

export default getRequestListPipeline;
