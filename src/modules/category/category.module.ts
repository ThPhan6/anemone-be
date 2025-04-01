import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Category } from '../../common/entities/category.entity';
import { SystemSetting } from '../../common/entities/system-setting.entity';
import { UserSetting } from '../../common/entities/user-setting.entity';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';

@Module({
  imports: [TypeOrmModule.forFeature([Category, SystemSetting, UserSetting])],
  controllers: [CategoryController],
  providers: [CategoryService],
})
export class CategoryModule {}
