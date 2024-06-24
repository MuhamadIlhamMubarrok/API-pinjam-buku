import { Module } from '@nestjs/common';
import { LibraryModule } from './modules/library.module';
@Module({
  imports: [LibraryModule],
})
export class AppModule {}
