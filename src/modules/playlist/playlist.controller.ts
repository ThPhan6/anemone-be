import {
  Body,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOperation } from '@nestjs/swagger';

import { MAX_SIZE_UPLOAD_IMAGE } from '../../common/constants/file.constant';
import { BaseController } from '../../core/controllers/base.controller';
import { ApiController } from '../../core/decorator/apiController.decorator';
import { MemberRoleGuard } from '../../core/decorator/auth.decorator';
import { AuthUser } from '../../core/decorator/auth-user.decorator';
import { ApiBaseGetListQueries } from '../../core/types/apiQuery.type';
import { UserDto } from '../auth/dto/auth-user.dto';
import { AddScentToPlayListDto } from './dto/add-scent-to-playlist.dto';
import { CreatePlaylistDto, UpdatePlaylistDto } from './dto/create-playlist.dto';
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
  @UseInterceptors(FileInterceptor('image', { dest: './dist/uploads' }))
  async create(
    @AuthUser() user: UserDto,
    @Body() bodyRequest: CreatePlaylistDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_SIZE_UPLOAD_IMAGE }),
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
        ],
        fileIsRequired: false,
      }),
    )
    image: Express.Multer.File,
  ) {
    const playlist = await this.playlistService.create(user.sub, bodyRequest, image);

    return playlist;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Partially update playlist data' })
  @UseInterceptors(FileInterceptor('image', { dest: './dist/uploads' }))
  async update(
    @AuthUser() user: UserDto,
    @Param('id') id: string,
    @Body() bodyRequest: UpdatePlaylistDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_SIZE_UPLOAD_IMAGE }),
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
        ],
        fileIsRequired: false,
      }),
    )
    image: Express.Multer.File,
  ) {
    const playlist = await this.playlistService.update(user.sub, id, bodyRequest, image);

    return playlist;
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update entire playlist data' })
  @UseInterceptors(FileInterceptor('image', { dest: './dist/uploads' }))
  async replace(
    @AuthUser() user: UserDto,
    @Param('id') id: string,
    @Body() bodyRequest: CreatePlaylistDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_SIZE_UPLOAD_IMAGE }),
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
        ],
        fileIsRequired: false,
      }),
    )
    image: Express.Multer.File,
  ) {
    const playlist = await this.playlistService.replace(user.sub, id, bodyRequest, image);

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
