import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserSetting } from '../../common/entities/user-setting.entity';
import { UnifiedSearchController } from './unified-search.controller';
import { UnifiedSearchService } from './unified-search.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserSetting])],
  providers: [UnifiedSearchService],
  controllers: [UnifiedSearchController],
})
export class UnifiedSearchModule {}
