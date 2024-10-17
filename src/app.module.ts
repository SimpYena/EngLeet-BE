import { Module } from '@nestjs/common';
import { ApiModule } from './api/api.module';
import { CoreModule } from './shared/core.module';

@Module({
  imports: [ApiModule, CoreModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
