import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException | unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    if (exception instanceof HttpException) {
      const errorResponse: any = exception.getResponse();
      // console.log(exception);
      let message: string | Array<string> = '';
      if (Array.isArray(errorResponse.message)) {
        message = errorResponse.message[0];
      } else {
        message = errorResponse.message;
      }
      response.status(status).send({
        message,
        status,
      });
    } else {
      console.log(exception);
      response
        .status(status)
        .send({ message: 'INTERNAL SERVER ERROR', status });
    }
  }
}
