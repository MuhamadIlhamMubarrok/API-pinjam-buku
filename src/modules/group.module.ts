import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { GroupController } from '../controllers/group.controller';
import { GroupService } from '../services/group.service';
import { MongooseModule } from '@nestjs/mongoose';
import { GroupSchema } from '../models/group.model';
import { MongooseConfigService } from 'src/db/db.config';
import { TransactionController } from 'src/controllers/transaction.controller';
import { TransactionService } from 'src/services/transaction.service';
import { NotificationWebsocketService } from 'src/services/notification.websocket.service';
import { SetUploadMiddleware } from 'utils';

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
  controllers: [GroupController, TransactionController],
  providers: [
    GroupService,
    MongooseConfigService,
    TransactionService,
    NotificationWebsocketService,
  ],
})
export class GroupModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(new SetUploadMiddleware('damages', 'picture').use)
      .forRoutes({
        path: '/v2/transaction/request/:id/damaged',
        method: RequestMethod.PUT,
      });
  }
}
