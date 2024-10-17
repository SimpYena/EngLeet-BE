import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  NotFoundException,
} from '@nestjs/common';
import { ErrorService } from '../error.service';

@Catch(NotFoundException)
export class NotFoundExceptionFilter implements ExceptionFilter {
  constructor(private readonly errorService: ErrorService) {}

  catch(exception: any, host: ArgumentsHost) {
    const { res, status, i18n, cause } = this.errorService.prepare(
      exception,
      host,
    );

    let errorId = exception.getResponse().message;
    if (errorId !== 'SYS-0003') errorId = 'SYS-0004';

    const body = this.errorService.handleException(
      errorId,
      cause,
      i18n,
      res,
      exception,
    );

    res.status(status).json(body);
  }
}
