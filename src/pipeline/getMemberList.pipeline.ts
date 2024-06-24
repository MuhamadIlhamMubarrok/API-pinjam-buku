import {
  FacetPipelineBuilder,
  PipelineBuilder,
  generateArrayFilter,
  generateSearchCondition,
} from 'utils';
import { GetMemberListDTO } from 'src/dto/member.dto';

const getMemberListPipeline = (query: GetMemberListDTO) => {
  const { search, page, limit, sortBy, sortOrder, name, isPunisment } = query;

  return new PipelineBuilder()
    .match({
      name: generateArrayFilter(name as string[]),
      isPunisment: generateArrayFilter(isPunisment as boolean[]),
    })
    .match({
      $or: [{ name: generateSearchCondition(search) }],
    })
    .lookup({
      from: 'books',
      localField: '_id',
      foreignField: 'borrower',
      as: 'books',
    })
    .addFields({
      books: {
        $map: {
          input: '$books',
          as: 'book',
          in: {
            _id: '$$book._id',
            title: '$$book.title',
            expiredBook: '$$book.expiredBook',
          },
        },
      },
    })
    .project({
      name: 1,
      isPunisment: 1,
      expiredPunisment: 1,
      books: 1,
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

export default getMemberListPipeline;
