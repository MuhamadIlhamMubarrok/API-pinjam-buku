import { Module, MiddlewareConsumer } from '@nestjs/common';
import { AuthMiddleware } from 'utils';
import { GroupModule } from './modules/group.module';
import { ReaderModule } from './modules/reader.module';
@Module({
  imports: [GroupModule, ReaderModule],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('*');
  }
}
