import { Module } from '@nestjs/common';
import { GroupController } from '../controllers/group.controller';
import { GroupService } from '../services/group.service';
import { MongooseModule } from '@nestjs/mongoose';
import { MongooseConfigService } from '../db/db.config';

@Module({
  imports: [MongooseModule.forRoot(`mongodb://127.0.0.1:27017/tagsamurai`)],
  controllers: [GroupController],
  providers: [GroupService, MongooseConfigService],
})
export class GroupModule {}
