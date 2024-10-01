import { Module } from '@nestjs/common';
import { ApiModule } from './api/api.module';
import { UsersModule } from 'src/api/modules/users/users.module';

@Module({
  imports: [ApiModule, UsersModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
