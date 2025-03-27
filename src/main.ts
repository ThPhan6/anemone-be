import 'dotenv/config';

import { BadRequestException, INestApplication, ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as Sentry from '@sentry/nestjs';
import { AppModule } from 'modules/app.module';

import { ExceptionFilter } from './core/filters/exception.filter';
import { logger, morganMiddleware } from './core/logger/index.logger';
import { TrimPipe } from './core/pipes/trim.pipe';

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

    await this.listen();
  }

  private configApp() {
    this.app.enableCors();
    const stopAtFirstError = process.env.STOP_AT_FIRST_VALIDATION_ERROR === 'YES';
    this.app.useGlobalPipes(
      new TrimPipe(),
      new ValidationPipe({
        transform: true,
        transformOptions: {
          exposeDefaultValues: true,
          enableImplicitConversion: true,
        },
        stopAtFirstError: stopAtFirstError,
        exceptionFactory: (errors) => {
          // If stopAtFirstError is true, return the first error
          if (stopAtFirstError && errors.length > 0) {
            const firstError = errors[0];

            return new BadRequestException({
              message: firstError.constraints,
              errors: firstError.constraints,
            });
          }

          // If not stopping at the first error, return all errors
          return new BadRequestException({
            message: 'Validation failed',
            errors: errors.map((err) => ({
              property: err.property,
              constraints: err.constraints,
            })),
          });
        },
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
