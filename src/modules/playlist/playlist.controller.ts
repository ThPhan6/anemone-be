import { Body, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import { BaseController } from '../../core/controllers/base.controller';
import { ApiController } from '../../core/decorator/apiController.decorator';
import { MemberRoleGuard } from '../../core/decorator/auth.decorator';
import { AuthUser } from '../../core/decorator/auth-user.decorator';
import { ApiBaseGetListQueries } from '../../core/types/apiQuery.type';
import { UserDto } from '../auth/dto/auth-user.dto';
import { AddScentToPlayListDto } from './dto/add-scent-to-playlist.dto';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { updateScentInPlaylistDto } from './dto/update-scent-in-playlist.dto';
import { PlaylistService } from './playlist.service';
@MemberRoleGuard()
@ApiController({
  name: 'playlists',
})
export class PlaylistController extends BaseController {
  constructor(private readonly playlistService: PlaylistService) {
    super();
  }

  @Get()
  @ApiOperation({ summary: 'Get all playlists by user' })
  async getAllPlaylists(@AuthUser() user: UserDto, @Query() queries: ApiBaseGetListQueries) {
    const playlists = await this.playlistService.get(user.sub, queries);

    return playlists;
  }

  @Get(':playlistId')
  async getPlaylistDetail(@Param('playlistId') playlistId: string) {
    return await this.playlistService.getById(playlistId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a playlist' })
  async create(@AuthUser() user: UserDto, @Body() bodyRequest: CreatePlaylistDto) {
    const playlist = await this.playlistService.create(user.sub, bodyRequest);

    return playlist;
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a playlist' })
  async update(
    @AuthUser() user: UserDto,
    @Param('id') id: string,
    @Body() bodyRequest: CreatePlaylistDto,
  ) {
    const playlist = await this.playlistService.update(user.sub, id, bodyRequest);

    return playlist;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a playlist' })
  async delete(@AuthUser() user: UserDto, @Param('id') id: string) {
    const playlist = await this.playlistService.delete(user.sub, id);

    return playlist;
  }

  @Get(':playlistId/scents')
  @ApiOperation({ summary: 'get list scent to add to playlist' })
  async getScentsOfPlaylist(
    @AuthUser() user: UserDto,
    @Param('playlistId') playlistId: string,
    @Query() queries: ApiBaseGetListQueries,
  ) {
    return this.playlistService.getScentsOfPlaylist(user.sub, playlistId, queries);
  }

  @Post(':playlistId/scents')
  @ApiOperation({ summary: 'add a scent to a playlist' })
  async addScentToPlaylist(
    @Param('playlistId') playlistId: string,
    @Body() addScentDto: AddScentToPlayListDto,
  ) {
    return this.playlistService.addScentToPlaylist(playlistId, addScentDto);
  }

  @Patch(':playlistId/scents/:scentId')
  @ApiOperation({ summary: 'Update the sequence of a scent in a playlist' })
  async updateScentInPlaylist(
    @Param('playlistId') playlistId: string,
    @Param('scentId') scentId: string,
    @Body() updateScentDto: updateScentInPlaylistDto,
  ) {
    return this.playlistService.updateScentInPlaylist(playlistId, scentId, updateScentDto);
  }

  @Delete(':playlistId/scents/:scentId')
  @ApiOperation({ summary: 'Remove a scent from a playlist' })
  async removeScentFromPlaylist(
    @Param('playlistId') playlistId: string,
    @Param('scentId') scentId: string,
  ) {
    return this.playlistService.removeScentFromPlaylist(playlistId, scentId);
  }
}
