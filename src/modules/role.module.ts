import { Module } from '@nestjs/common';
import { RoleController } from '../controllers/role.controller';
import { RoleService } from '../services/role.service';
import { MongooseModule } from '@nestjs/mongoose';
import { GroupSchema } from 'src/models/group.model';

@Module({
<<<<<<< HEAD:src/modules/role.module.ts
  imports: [MongooseModule.forRoot(`mongodb://127.0.0.1:27017/tagsamurai`)],
  controllers: [RoleController],
  providers: [RoleService, MongooseConfigService],
=======
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
  providers: [GroupService],
>>>>>>> parent of f638c27 (feat: add request scoped service with connection):src/modules/group.module.ts
})
export class RoleModule {}
