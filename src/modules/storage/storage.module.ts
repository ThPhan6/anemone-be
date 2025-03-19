import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';

@Global()
@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [StorageController],
  providers: [ConfigService, StorageService],
  exports: [StorageService],
})
export class StorageModule {
  static forRoot(): DynamicModule {
    return {
      module: StorageModule,
      global: true,
    };
  }
}
