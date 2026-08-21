"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AllExceptionsFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalHttpExceptionFilter = exports.AllExceptionsFilter = void 0;
const common_1 = require("@nestjs/common");
let AllExceptionsFilter = AllExceptionsFilter_1 = class AllExceptionsFilter {
    logger = new common_1.Logger(AllExceptionsFilter_1.name);
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const status = exception instanceof common_1.HttpException
            ? exception.getStatus()
            : common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        const exceptionResponse = exception instanceof common_1.HttpException ? exception.getResponse() : null;
        let message = 'Internal server error';
        let code = 'INTERNAL_ERROR';
        if (typeof exceptionResponse === 'string') {
            message = exceptionResponse;
        }
        else if (typeof exceptionResponse === 'object' &&
            exceptionResponse !== null) {
            const resObj = exceptionResponse;
            message = resObj.message || message;
            code = resObj.error || code;
        }
        else if (exception instanceof Error) {
            message = exception.message;
        }
        const requestId = request.requestId ||
            request.headers['x-request-id'] ||
            `req_${Date.now().toString(36)}`;
        if (status >= 500) {
            this.logger.error(`[${requestId}] 500 Error on ${request.method} ${request.url}: ${message}`, exception instanceof Error ? exception.stack : undefined);
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
};
exports.AllExceptionsFilter = AllExceptionsFilter;
exports.AllExceptionsFilter = AllExceptionsFilter = AllExceptionsFilter_1 = __decorate([
    (0, common_1.Catch)()
], AllExceptionsFilter);
exports.GlobalHttpExceptionFilter = AllExceptionsFilter;
//# sourceMappingURL=http-exception.filter.js.map