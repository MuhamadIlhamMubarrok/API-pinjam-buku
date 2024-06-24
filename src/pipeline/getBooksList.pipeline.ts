import {
  FacetPipelineBuilder,
  PipelineBuilder,
  generateArrayFilter,
  generateSearchCondition,
} from 'utils';
import { GetBookListDTO } from 'src/dto/book.dto';

const getBooksListPipeline = (query: GetBookListDTO) => {
  const {
    search,
    page,
    limit,
    sortBy,
    sortOrder,
    code,
    title,
    isBorrow,
    author,
    isDamaged,
  } = query;

  return new PipelineBuilder()
    .match({
      code: generateArrayFilter(code as string[]),
      title: generateArrayFilter(title as string[]),
      isBorrow: generateArrayFilter(isBorrow as boolean[]),
      author: generateArrayFilter(author as string[]),
      isDamaged: generateArrayFilter(isDamaged as boolean[]),
    })
    .match({
      $or: [
        { code: generateSearchCondition(search) },
        { title: generateSearchCondition(search) },
        { author: generateSearchCondition(search) },
        { stock: generateSearchCondition(search) },
      ],
    })
    .project({
      code: 1,
      borrower: 1,
      isBorrow: 1,
      expiredBook: 1,
      title: 1,
      author: 1,
      isDamaged: 1,
      stock: 1,
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

export default getBooksListPipeline;
