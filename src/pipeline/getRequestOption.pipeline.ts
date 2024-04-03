import {
  FacetPipelineBuilder,
  PipelineBuilder,
  generateArrayFilter,
  generateSearchCondition,
} from 'utils';
import { GetRequestOptionDTO } from 'src/dto/transaction.dto';
import { Types } from 'mongoose';

const getRequestOptionPipeline = (query: GetRequestOptionDTO) => {
  const {
    search,
    name,
    brand,
    model,
    transactionId,
    nameOptions,
    brandOptions,
    modelOptions,
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
      assetName: 1,
      assetBrand: 1,
      assetModel: 1,
    })
    .facet({
      nameOptions: new FacetPipelineBuilder()
        .match({
          assetName: { $ne: null },
          $expr: { $eq: [nameOptions, true] },
        })
        .group({ _id: { label: '$assetName.name', value: '$assetName.key' } })
        .sort({ '_id.label': 1 })
        .build(),
      brandOptions: new FacetPipelineBuilder()
        .match({
          assetBrand: { $ne: null },
          $expr: { $eq: [brandOptions, true] },
        })
        .group({
          _id: { label: '$assetBrand.name', value: '$assetBrand.key' },
        })
        .sort({ '_id.label': 1 })
        .build(),
      modelOptions: new FacetPipelineBuilder()
        .match({
          assetModel: { $ne: null },
          $expr: { $eq: [modelOptions, true] },
        })
        .group({
          _id: { label: '$assetModel.name', value: '$assetModel.key' },
        })
        .sort({ '_id.label': 1 })
        .build(),
    })
    .set({
      nameOptions: '$nameOptions._id',
      brandOptions: '$brandOptions._id',
      modelOptions: '$modelOptions._id',
    })
    .build();
};

export default getRequestOptionPipeline;
