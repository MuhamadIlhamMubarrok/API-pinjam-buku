import { Module } from '@nestjs/common';
import { GroupController } from '../controllers/group.controller';
import { GroupService } from '../services/group.service';
import { MongooseModule } from '@nestjs/mongoose';
import { GroupSchema } from '../models/group.model';
import { MongooseConfigService } from 'src/db/db.config';

@Module({
  imports: [
    MongooseModule.forRoot(`mongodb://127.0.0.1:27017/00000_tagsamurai`, {
      connectionName: 'companyConnection',
    }),
    MongooseModule.forFeature(
      [{ name: 'groups', schema: GroupSchema }],
      'companyConnection',
    ),
  ],
  controllers: [GroupController],
  providers: [GroupService, MongooseConfigService],
})
export class GroupModule {}
