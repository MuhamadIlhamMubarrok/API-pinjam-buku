import {
  FacetPipelineBuilder,
  PipelineBuilder,
  generateArrayFilter,
  generateSearchCondition,
} from 'utils';
import { Types } from 'mongoose';
import { GetApprovalPerTransactionDTO } from 'src/dto/approval.dto';

const getApprovalPerTransactionPipeline = (
  query: GetApprovalPerTransactionDTO,
) => {
  const {
    search,
    page,
    limit,
    sortBy,
    sortOrder,
    status,
    asset,
    brand,
    model,
    transaction,
    loggedInUser,
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
      imageSmall: '$request.assetImageSmall',
      imageMedium: '$request.assetImageMedium',
      imageBig: '$request.assetImageBig',
      name: '$request.assetName.nameWithSequence',
      brand: '$request.assetBrand.name',
      model: '$request.assetModel.name',
      notes: 1,
      isApproved: 1,
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

export default getApprovalPerTransactionPipeline;
