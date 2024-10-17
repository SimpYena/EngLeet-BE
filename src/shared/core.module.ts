import { Module } from '@nestjs/common';
import { ErrorModule } from './modules/error/error.module';

@Module({
  imports: [ErrorModule],
})
export class CoreModule {}
