import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Category } from '../../common/entities/category.entity';
import { Scent } from '../../common/entities/scent.entity';
import { ScentMobileController } from './scent.mobile.controller';
import { ScentMobileService } from './scent.mobile.service';

@Module({
  imports: [TypeOrmModule.forFeature([Scent, Category])],
  controllers: [ScentMobileController],
  providers: [ScentMobileService],
})
export class ScentMobileModule {}
