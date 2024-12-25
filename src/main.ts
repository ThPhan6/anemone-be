import 'dotenv/config';

import { BadRequestException, INestApplication, ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as Sentry from '@sentry/nestjs';
import { AppModule } from 'modules/app.module';

import { ExceptionFilter } from './core/filters/exception.filter';
import { logger, morganMiddleware } from './core/logger/index.logger';

class App {
  public app: INestApplication;
  public port: string | number;
  public env: string;

  constructor() {
    this.port = process.env.PORT || 3000;
    this.env = process.env.NODE_ENV || 'development';

    this.initApp();
  }

  private async initApp() {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,

      // Add Tracing by setting tracesSampleRate
      // We recommend adjusting this value in production
      tracesSampleRate: 1.0,
    });

    Sentry.setTag('project', 'tangent');

    this.app = await NestFactory.create(AppModule);
    this.configApp();

    this.initAPIDocs();

    this.initializeMiddleware();

    this.filterException();

    this.listen();
  }

  private configApp() {
    this.app.enableCors();
    const stopAtFirstError = process.env.STOP_AT_FIRST_VALIDATION_ERROR === 'YES';
    this.app.useGlobalPipes(
      new ValidationPipe({
        transformOptions: {
          excludeExtraneousValues: true,
          exposeDefaultValues: true,
          enableImplicitConversion: false,
        },
        stopAtFirstError: stopAtFirstError,
        exceptionFactory: (e) =>
          new BadRequestException({ errors: !stopAtFirstError ? e : undefined }),
      }),
    );
  }

  private initAPIDocs() {
    if (process.env.API_DOC_STATUS !== 'public') {
      return;
    }

    const config = new DocumentBuilder()
      .setTitle('API document')
      .addBearerAuth()
      .setDescription('The API description')
      .setVersion('1.0')
      .build();
    const document = SwaggerModule.createDocument(this.app, config);
    SwaggerModule.setup('api-docs', this.app, document);
  }

  private filterException() {
    const { httpAdapter } = this.app.get(HttpAdapterHost);
    this.app.useGlobalFilters(new ExceptionFilter(httpAdapter));
  }

  public async listen() {
    await this.app.listen(this.port, () => {
      logger.info(`🚀 App listening on the port ${this.port}`);
    });
  }

  private initializeMiddleware() {
    this.app.use(morganMiddleware);
  }
}

new App();
