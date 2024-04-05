import {
  FacetPipelineBuilder,
  PipelineBuilder,
  generateArrayFilter,
  generateSearchCondition,
} from 'utils';
import { Types } from 'mongoose';
import { GetApprovalPerTransactionOptionDTO } from 'src/dto/approval.dto';

const getApprovalPerTransactionOptionPipeline = (
  query: GetApprovalPerTransactionOptionDTO,
) => {
  const {
    search,
    status,
    asset,
    brand,
    model,
    transaction,
    loggedInUser,
    assetOptions,
    brandOptions,
    modelOptions,
  } = query;

  return new PipelineBuilder()
    .match({
      status: generateArrayFilter(status as string[]),
      'user._id': new Types.ObjectId(loggedInUser),
      transaction: new Types.ObjectId(transaction),
    })
    .lookup({
      from: 'assignment_requests',
      localField: 'request',
      foreignField: '_id',
      as: 'request',
    })
    .match({
      'request.assetName.key': generateArrayFilter(asset as number[]),
      'request.assetBrand.key': generateArrayFilter(brand as number[]),
      'request.assetModel.key': generateArrayFilter(model as number[]),
    })
    .match({
      $or: [
        { 'user.fullName': generateSearchCondition(search) },
        { transactionId: generateSearchCondition(search) },
        { 'manager.fullName': generateSearchCondition(search) },
        { 'group.name': generateSearchCondition(search) },
        { 'assignedTo.fullName': generateSearchCondition(search) },
        { status: generateSearchCondition(search) },
        {
          'request.assetName.nameWithSequence': generateSearchCondition(search),
        },
        { 'request.assetBrand.name': generateSearchCondition(search) },
        { 'request.assetModel.name': generateSearchCondition(search) },
        { 'request.assetGroup.name': generateSearchCondition(search) },
        { 'request.assetTagType': generateSearchCondition(search) },
      ],
    })
    .addFields({
      request: { $first: '$request' },
    })
    .project({
      asset: '$request.assetName',
      brand: '$request.assetBrand',
      model: '$request.assetModel',
    })
    .facet({
      assetOptions: new FacetPipelineBuilder()
        .match({
          asset: { $ne: null },
          $expr: { $eq: [assetOptions, true] },
        })
        .group({
          _id: { label: '$asset.nameWithSequence', value: '$asset.key' },
        })
        .sort({ '_id.label': 1 })
        .build(),
      brandOptions: new FacetPipelineBuilder()
        .match({
          brand: { $ne: null },
          $expr: { $eq: [brandOptions, true] },
        })
        .group({
          _id: { label: '$brand.name', value: '$brand.key' },
        })
        .sort({ '_id.label': 1 })
        .build(),
      modelOptions: new FacetPipelineBuilder()
        .match({
          model: { $ne: null },
          $expr: { $eq: [modelOptions, true] },
        })
        .group({
          _id: { label: '$model.name', value: '$model.key' },
        })
        .sort({ '_id.label': 1 })
        .build(),
    })
    .set({
      assetOptions: '$assetOptions._id',
      brandOptions: '$brandOptions._id',
      modelOptions: '$modelOptions._id',
    })
    .build();
};

export default getApprovalPerTransactionOptionPipeline;
