import { Module } from '@nestjs/common';
import { RoleController } from '../controllers/role.controller';
import { RoleService } from '../services/role.service';
import { MongooseModule } from '@nestjs/mongoose';
import { MongooseConfigService } from '../db/db.config';

@Module({
  imports: [MongooseModule.forRoot(`mongodb://127.0.0.1:27017/tagsamurai`)],
  controllers: [RoleController],
  providers: [RoleService, MongooseConfigService],
})
export class RoleModule {}
