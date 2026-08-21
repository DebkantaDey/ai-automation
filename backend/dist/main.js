"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const swagger_1 = require("@nestjs/swagger");
const cookieParser = require("cookie-parser");
const app_module_1 = require("./app.module");
const http_exception_filter_1 = require("./core/common/filters/http-exception.filter");
const transform_interceptor_1 = require("./core/common/interceptors/transform.interceptor");
const logging_interceptor_1 = require("./core/common/interceptors/logging.interceptor");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    const appConfig = configService.get('app');
    const port = appConfig?.port || 4000;
    const apiPrefix = appConfig?.apiPrefix || 'api/v1';
    app.setGlobalPrefix(apiPrefix);
    app.use(cookieParser());
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    app.useGlobalFilters(new http_exception_filter_1.AllExceptionsFilter());
    app.useGlobalInterceptors(new logging_interceptor_1.LoggingInterceptor(), new transform_interceptor_1.TransformInterceptor());
    app.enableCors({
        origin: appConfig?.corsOrigins || ['http://localhost:3000'],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'x-api-key',
            'x-organization-id',
            'x-workspace-id',
            'x-request-id',
            'x-correlation-id',
        ],
    });
    const swaggerConfig = new swagger_1.DocumentBuilder()
        .setTitle('AI Business Automation SaaS Platform API')
        .setDescription('Production-Ready Multi-Tenant AI Workflow & Autonomous Agent SaaS API')
        .setVersion('1.0')
        .addBearerAuth()
        .addApiKey({ type: 'apiKey', name: 'x-api-key', in: 'header' }, 'x-api-key')
        .addApiKey({ type: 'apiKey', name: 'x-organization-id', in: 'header' }, 'x-organization-id')
        .addApiKey({ type: 'apiKey', name: 'x-workspace-id', in: 'header' }, 'x-workspace-id')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    app.enableShutdownHooks();
    await app.listen(port);
    logger.log(`Server is running at http://localhost:${port}/${apiPrefix}`);
    logger.log(`Swagger documentation available at http://localhost:${port}/api/docs`);
}
bootstrap().catch((err) => {
    console.error('Fatal error during application startup:', err);
    process.exit(1);
});
//# sourceMappingURL=main.js.map