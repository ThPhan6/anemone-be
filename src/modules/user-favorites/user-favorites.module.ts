import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserFavorites } from 'common/entities/user-favorites.entity';

import { AwsConfigService } from '../../common/config/aws.config';
import { Album } from '../../common/entities/album.entity';
import { CognitoService } from '../auth/cognito.service';
import { UserFavoritesController } from './user-favorites.controller';
import { UserFavoritesService } from './user-favorites.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserFavorites, Album])],
  providers: [UserFavoritesService, CognitoService, AwsConfigService],
  controllers: [UserFavoritesController],
  exports: [UserFavoritesService],
})
export class UserFavoritesModule {}
