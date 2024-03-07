import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReaderController } from 'src/controllers/reader.controller';
import { MongooseConfigService } from 'src/db/db.config';
import { ReaderSchema } from 'src/models/reader.model';
import { ReaderService } from 'src/services/reader.service';

@Module({
  imports: [
    MongooseModule.forRoot(`mongodb://127.0.0.1:27017/00000_tagsamurai`, {
      connectionName: 'readerConnection',
    }),
    MongooseModule.forFeature(
      [{ name: 'readers', schema: ReaderSchema }],
      'readerConnection',
    ),
  ],
  controllers: [ReaderController],
  providers: [ReaderService, MongooseConfigService],
})
export class ReaderModule {}
