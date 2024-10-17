import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ErrorService } from '../error.service';
import { I18nContext } from 'nestjs-i18n';

@Catch(UnprocessableEntityException)
export class UnprocessableEntityExceptionFilter implements ExceptionFilter {
  constructor(private readonly errorService: ErrorService) {}

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res: any = ctx.getResponse<Response>();
    const i18n: I18nContext = res.req.i18nContext;
    const validationErrors = exception.getResponse().message;

    const body = this.errorService.handleUnprocessableEntityException(
      validationErrors,
      i18n,
    );

    res.status(HttpStatus.BAD_REQUEST).json(body);
  }
}
