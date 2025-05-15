import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ScentConfigRepository } from '../../common/repositories/scent-config.repository';
import { ScentConfig } from './entities/scent-config.entity';
import { ScentConfigService } from './scent-config.service';
@Module({
  imports: [TypeOrmModule.forFeature([ScentConfig])],
  controllers: [],
  providers: [ScentConfigService, ScentConfigRepository],
  exports: [ScentConfigService],
})
export class ScentConfigModule {}
