import { Module, Global } from '@nestjs/common';
import { MongooseConfigService } from './db.config';

@Global()
@Module({
  providers: [MongooseConfigService],
  exports: [MongooseConfigService],
})
export class MongooseConfigModule {}
