import { Body, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { User } from '@sentry/nestjs';

import { FavoriteType } from '../../common/entities/user-favorites.entity';
import { BaseController } from '../../core/controllers/base.controller';
import { ApiController } from '../../core/decorator/apiController.decorator';
import { MemberRoleGuard } from '../../core/decorator/auth.decorator';
import { AuthUser } from '../../core/decorator/auth-user.decorator';
import { CreateUserFavoriteDto } from './dto/request.dto';
import { UserFavoritesService } from './user-favorites.service';

@MemberRoleGuard()
@ApiController({
  name: 'user-favorites',
})
export class UserFavoritesController extends BaseController {
  constructor(private readonly userFavoritesService: UserFavoritesService) {
    super();
  }

  @Get()
  @ApiOperation({
    summary: 'Get all favorites',
  })
  async get(@AuthUser() user: User, @Query('type') type: FavoriteType) {
    return this.userFavoritesService.get(user.sub, type);
  }

  @Post()
  @ApiOperation({
    summary: 'Add a favorite',
  })
  async create(@AuthUser() user: User, @Body() body: CreateUserFavoriteDto) {
    return this.userFavoritesService.create(user.sub, body);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a favorite',
  })
  async delete(@AuthUser() user: User, @Param('id') id: string) {
    return this.userFavoritesService.delete(user.sub, id);
  }
}
