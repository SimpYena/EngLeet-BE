import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ErrorService } from '../error.service';

@Catch()
export class InternalServerErrorExceptionFilter implements ExceptionFilter {
  constructor(private readonly errorService: ErrorService) {}

  catch(exception: any, host: ArgumentsHost) {
    if (!(exception instanceof HttpException)) {      
      const stack = exception.stack;
      exception = new InternalServerErrorException(exception.message);
      exception.stack = stack;
    }    

    const { res, status, i18n, cause } = this.errorService.prepare(
      exception,
      host,
    );

    const body = this.errorService.handleException(
      'SYS-0003',
      cause,
      i18n,
      res,
      exception,
    );

    res.status(status).json(body);
  }
}
