import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { AppConfig } from './core/config/app.config';
import { AllExceptionsFilter } from './core/common/filters/http-exception.filter';
import { TransformInterceptor } from './core/common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './core/common/interceptors/logging.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const appConfig = configService.get<AppConfig>('app');

  const port = appConfig?.port || 4000;
  const apiPrefix = appConfig?.apiPrefix || 'api/v1';

  // Global Prefix
  app.setGlobalPrefix(apiPrefix);

  // Cookie Parser
  app.use(cookieParser());

  // Global Interceptors and Filters
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );

  // CORS Configuration
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

  // Swagger Documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('AI Business Automation SaaS Platform API')
    .setDescription('Production-Ready Multi-Tenant AI Workflow & Autonomous Agent SaaS API')
    .setVersion('1.0')
    .addBearerAuth()
    .addApiKey({ type: 'apiKey', name: 'x-api-key', in: 'header' }, 'x-api-key')
    .addApiKey({ type: 'apiKey', name: 'x-organization-id', in: 'header' }, 'x-organization-id')
    .addApiKey({ type: 'apiKey', name: 'x-workspace-id', in: 'header' }, 'x-workspace-id')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  app.enableShutdownHooks();

  await app.listen(port);
  logger.log(`Server is running at http://localhost:${port}/${apiPrefix}`);
  logger.log(`Swagger documentation available at http://localhost:${port}/api/docs`);
}

bootstrap().catch((err) => {
  console.error('Fatal error during application startup:', err);
  process.exit(1);
});
