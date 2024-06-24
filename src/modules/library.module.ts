import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MongooseConfigService } from 'src/db/db.config';
import { MemberSchema } from 'src/models/member.model';
import { BooksSchema } from 'src/models/books.model';
import { MemberController } from 'src/controllers/member.controller';
import { MemberService } from 'src/services/member.service';
import { BookService } from 'src/services/books.service';
import { BookController } from 'src/controllers/books.controller';

@Module({
  imports: [
    MongooseModule.forRoot(`mongodb://127.0.0.1:27017/00000_perpustakaan`, {
      connectionName: 'companyConnection',
    }),
    MongooseModule.forFeature(
      [
        { name: 'member', schema: MemberSchema },
        { name: 'book', schema: BooksSchema },
      ],
      'companyConnection',
    ),
  ],
  controllers: [MemberController, BookController],
  providers: [MongooseConfigService, MemberService, BookService],
})
export class LibraryModule {}
