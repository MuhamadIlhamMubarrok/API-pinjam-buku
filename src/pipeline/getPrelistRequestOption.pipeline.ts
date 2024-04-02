import {
  FacetPipelineBuilder,
  PipelineBuilder,
  generateArrayFilter,
  generateSearchCondition,
} from 'utils';
import { GetPrelistRequestOptionDTO } from 'src/dto/prelist.dto';

const getPrelistRequestOptionPipeline = (query: GetPrelistRequestOptionDTO) => {
  const {
    search,
    asset,
    brand,
    model,
    tag,
    assetOptions,
    brandOptions,
    modelOptions,
    tagOptions,
    groupOptions,
    group,
  } = query;

  return new PipelineBuilder()
    .match({
      'assetName.key': generateArrayFilter(asset as number[]),
      'assetBrand.key': generateArrayFilter(brand as number[]),
      'assetModel.key': generateArrayFilter(model as number[]),
      'assetGroup.key': generateArrayFilter(group as number[]),
      assetTagType: generateArrayFilter(tag as string[]),
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
      asset: '$assetName',
      brand: '$assetBrand',
      model: '$assetModel',
      group: '$assetGroup',
      tag: '$assetTagType',
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
      brandOptions: new FacetPipelineBuilder()
        .match({
          brand: { $ne: null },
          $expr: { $eq: [brandOptions, true] },
        })
        .group({ _id: { label: '$brand.name', value: '$brand.key' } })
        .sort({ '_id.label': 1 })
        .build(),
      modelOptions: new FacetPipelineBuilder()
        .match({
          model: { $ne: null },
          $expr: { $eq: [modelOptions, true] },
        })
        .group({ _id: { label: '$model.name', value: '$model.key' } })
        .sort({ '_id.label': 1 })
        .build(),
      tagOptions: new FacetPipelineBuilder()
        .match({
          tag: { $ne: null },
          $expr: { $eq: [tagOptions, true] },
        })
        .group({ _id: { label: '$tag', value: '$tag' } })
        .sort({ '_id.label': 1 })
        .build(),
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
    })
    .set({
      groupOptions: '$groupOptions._id',
      brandOptions: '$brandOptions._id',
      modelOptions: '$modelOptions._id',
      assetOptions: '$assetOptions._id',
      tagOptions: '$tagOptions._id',
    })
    .build();
};

export default getPrelistRequestOptionPipeline;
