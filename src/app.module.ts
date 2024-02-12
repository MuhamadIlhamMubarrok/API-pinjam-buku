import { Module, MiddlewareConsumer } from '@nestjs/common';
import { AuthMiddleware } from 'utils';
import { GroupModule } from './modules/group.module';
@Module({
  imports: [GroupModule],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('*');
  }
}
