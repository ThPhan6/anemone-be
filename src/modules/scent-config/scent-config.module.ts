import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ScentConfigRepository } from '../../common/repositories/scent-config.repository';
import { ScentConfig } from './entities/scent-config.entity';
import { ScentConfigController } from './scent-config.controller';
import { ScentConfigService } from './scent-config.service';
import { ScentConfigAdminController } from './scent-config-admin.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ScentConfig])],
  controllers: [ScentConfigAdminController, ScentConfigController],
  providers: [ScentConfigService, ScentConfigRepository],
  exports: [ScentConfigService],
})
export class ScentConfigModule {}
