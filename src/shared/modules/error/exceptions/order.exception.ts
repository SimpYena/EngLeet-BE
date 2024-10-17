import { HttpException } from '@nestjs/common';

export class OrderException extends HttpException {
  constructor(errorId, statusCode) {
    super(errorId, statusCode);
  }
}
