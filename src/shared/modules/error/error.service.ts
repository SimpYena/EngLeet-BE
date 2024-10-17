import { ArgumentsHost, Injectable } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { I18nContext } from 'nestjs-i18n';
import { plainToInstance } from 'class-transformer';
import { ErrorDTO } from './dto/error.dto';
import { ErrorDetailDTO } from './dto/error-detail.dto';

@Injectable()
export class ErrorService {

  handleUnprocessableEntityException(
    validationErrors: ValidationError[],
    i18n: I18nContext,
  ) {
    try {
      const error = plainToInstance(ErrorDTO, i18n.t('error.SYS-0002'));

      validationErrors.forEach((validationError) => {
        const field = validationError.property;
        const errorId = Object.values(validationError.constraints)[0];

        const errorDetailDTO = plainToInstance(
          ErrorDetailDTO,
          i18n.t(`error.${errorId}`, {
            args: { field },
          }),
        );

        error.errors = [...error.errors, errorDetailDTO];
      });

      return { error };
    } catch (err) {
      throw err;
    }
  }

  handleException(
    errorId: string,
    cause: string,
    i18n: I18nContext,
    res: any,
    exception: any,
  ) {
    try {
      errorId = errorId === 'Unauthorized' ? 'SYS-0001' : errorId;

      const error = plainToInstance(ErrorDTO, i18n.t(`error.${errorId}`));

      return { error };
    } catch (err) {
      throw err;
    }
  }

  getCause(exception) {
    const stackTrace = exception.stack;
    const regex = /\s+at\s([\w$]+)\.(\w+)\s\(/;
    const match = regex.exec(stackTrace);
    const className = match ? match[1] : 'Unknown';

    return className;
  }

  prepare(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res: any = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const i18n: I18nContext = I18nContext.current(host);
    const cause = this.getCause(exception);
    const errorId = exception.getResponse()?.message;

    return { res, status, i18n, cause, errorId };
  }
}
