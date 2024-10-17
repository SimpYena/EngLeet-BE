import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
} from '@nestjs/common';
import { ErrorService } from '../error.service';

@Catch(BadRequestException)
export class BadRequestExceptionFilter implements ExceptionFilter {
  constructor(private readonly errorService: ErrorService) {}

  catch(exception: any, host: ArgumentsHost) {
    const { res, status, i18n, cause, errorId } = this.errorService.prepare(
      exception,
      host,
    );

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
