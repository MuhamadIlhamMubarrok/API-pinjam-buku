import { Module, MiddlewareConsumer } from '@nestjs/common';
import { AuthMiddleware } from 'utils';
import { RoleModule } from './modules/role.module';
@Module({
  imports: [RoleModule],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('*');
  }
}
