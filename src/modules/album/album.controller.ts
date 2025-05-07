import { Body, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import { BaseController } from '../../core/controllers/base.controller';
import { ApiController } from '../../core/decorator/apiController.decorator';
import { MemberRoleGuard } from '../../core/decorator/auth.decorator';
import { AuthUser } from '../../core/decorator/auth-user.decorator';
import { ApiBaseGetListQueries } from '../../core/types/apiQuery.type';
import { UserDto } from '../auth/dto/auth-user.dto';
import { AlbumService } from './album.service';
import { AddPlaylistToAlbumDto } from './dto/add-playlist-to-album';
import { CreateAlbumDto } from './dto/album-request';

@MemberRoleGuard()
@ApiController({
  name: 'albums',
})
export class AlbumController extends BaseController {
  constructor(private readonly albumService: AlbumService) {
    super();
  }

  @Get()
  @ApiOperation({ summary: 'Get all albums' })
  async get(@AuthUser() user: UserDto, @Query() queries: ApiBaseGetListQueries) {
    return this.albumService.get(user.sub, queries);
  }

  @Get(':albumId')
  @ApiOperation({ summary: 'Get an album by ID' })
  async getAlbumById(@Param('albumId') albumId: string) {
    return this.albumService.getById(albumId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new album' })
  async create(@AuthUser() user: UserDto, @Body() body: CreateAlbumDto) {
    return this.albumService.create(user.sub, body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an album' })
  async update(@AuthUser() user: UserDto, @Param('id') id: string, @Body() body: CreateAlbumDto) {
    return this.albumService.update(user.sub, id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an album' })
  async delete(@AuthUser() user: UserDto, @Param('id') id: string) {
    return this.albumService.delete(user.sub, id);
  }

  @Get(':albumId/playlists')
  @ApiOperation({ summary: 'Get list of playlists in an album' })
  async getAlbumPlaylists(
    @AuthUser() user: UserDto,
    @Param('albumId') albumId: string,
    @Query() queries: ApiBaseGetListQueries,
  ) {
    return this.albumService.getAlbumPlaylists(user.sub, albumId, queries);
  }

  @Post(':albumId/playlists')
  @ApiOperation({ summary: 'Add a playlist to an album' })
  async addPlaylistToAlbum(
    @AuthUser() user: UserDto,
    @Param('albumId') albumId: string,
    @Body() dto: AddPlaylistToAlbumDto,
  ) {
    return this.albumService.addPlaylistToAlbum(albumId, dto.playlistId, user.sub);
  }

  @Delete(':albumId/playlists/:playlistId')
  @ApiOperation({ summary: 'Remove a playlist from an album' })
  async removePlaylistFromAlbum(
    @Param('albumId') albumId: string,
    @Param('playlistId') playlistId: string,
  ) {
    return this.albumService.removePlaylistFromAlbum(albumId, playlistId);
  }
}
