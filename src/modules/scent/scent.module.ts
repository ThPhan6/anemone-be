import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Scent } from '../../common/entities/scent.entity';
import { ScentRepository } from '../../common/repositories/scent.repository';
import { ScentController } from './scent.controller';
import { ScentService } from './scent.service';

@Module({
  imports: [ConfigModule.forRoot(), TypeOrmModule.forFeature([Scent])],
  controllers: [ScentController],
  providers: [ScentService, ScentRepository],
})
export class ScentModule {}
