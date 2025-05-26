import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettingDefinitionRepository } from 'common/repositories/setting-definition.repository';

import { ScentConfigRepository } from '../../common/repositories/scent-config.repository';
import { Product } from '../../modules/device/entities/product.entity';
import { StorageModule } from '../../modules/storage/storage.module';
import { SettingDefinition } from '../../modules/system/entities/setting-definition.entity';
import { ScentConfig } from './entities/scent-config.entity';
import { ScentConfigService } from './scent-config.service';

@Module({
  imports: [TypeOrmModule.forFeature([ScentConfig, SettingDefinition, Product]), StorageModule],
  providers: [ScentConfigService, ScentConfigRepository, SettingDefinitionRepository],
  exports: [ScentConfigService],
})
export class ScentConfigModule {}
