import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'common/entities/user.entity';
import { UserRepository } from 'common/repositories/user.repository';
import { StorageModule } from 'modules/storage/storage.module';

import { CommonController } from './common.controller';
import { CommonService } from './common.service';

@Module({
  imports: [ThrottlerModule.forRoot(), TypeOrmModule.forFeature([UserEntity]), StorageModule.forRoot()],
  controllers: [CommonController],
  providers: [CommonService, UserRepository],
})
export class CommonModule {}
