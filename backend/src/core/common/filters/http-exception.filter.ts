import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

    let message = 'Internal server error';
    let code = 'INTERNAL_ERROR';

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null
    ) {
      const resObj = exceptionResponse as Record<string, any>;
      message = resObj.message || message;
      code = resObj.error || code;
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    const requestId =
      (request as any).requestId ||
      request.headers['x-request-id'] ||
      `req_${Date.now().toString(36)}`;

    // Log internal errors on server without leaking details to client
    if (status >= 500) {
      this.logger.error(
        `[${requestId}] 500 Error on ${request.method} ${request.url}: ${message}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    const errorResponse = {
      success: false,
      statusCode: status,
      code: typeof code === 'string' ? code.toUpperCase().replace(/\s+/g, '_') : 'ERROR',
      message: Array.isArray(message) ? message[0] : message,
      requestId,
      timestamp: new Date().toISOString(),
    };

    response.status(status).json(errorResponse);
  }
}

export const GlobalHttpExceptionFilter = AllExceptionsFilter;
