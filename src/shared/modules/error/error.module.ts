import {
  Module,
  UnprocessableEntityException,
  ValidationPipe,
} from '@nestjs/common';
import { ErrorService } from './error.service';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { UnprocessableEntityExceptionFilter } from './filters/unprocessable-entity-exception.filter';
import { BadRequestExceptionFilter } from './filters/bad-request-exception.filter';
import { UnauthorizedExceptionFilter } from './filters/unauthorized-exception.filter';
import { InternalServerErrorExceptionFilter } from './filters/internal-server-error-exception.filter';
import { NotFoundExceptionFilter } from './filters/not-found-exception.filter';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/api/common/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [
    ErrorService,
    {
      provide: APP_FILTER,
      useClass: InternalServerErrorExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: NotFoundExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: UnauthorizedExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: BadRequestExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: UnprocessableEntityExceptionFilter,
    },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        transform: true,
        whitelist: true,
        exceptionFactory: (errors) => new UnprocessableEntityException(errors),
      }),
    },
  ],
})
export class ErrorModule {}
