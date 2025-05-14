import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, In, Repository } from 'typeorm';

import { MESSAGE } from '../../common/constants/message.constant';
import { Album } from '../../common/entities/album.entity';
import { AlbumPlaylist } from '../../common/entities/album-playlist.entity';
import { Playlist } from '../../common/entities/playlist.entity';
import { FavoriteType, UserFavorites } from '../../common/entities/user-favorites.entity';
import { UserSetting } from '../../common/entities/user-setting.entity';
import { convertURLToS3Readable } from '../../common/utils/file';
import { paginate } from '../../common/utils/helper';
import { ApiBaseGetListQueries } from '../../core/types/apiQuery.type';
import { CognitoService } from '../auth/cognito.service';
import { StorageService } from '../storage/storage.service';
import { CreateAlbumDto, UpdateAlbumDto } from './dto/album-request';

@Injectable()
export class AlbumService {
  constructor(
    @InjectRepository(Album)
    private readonly albumRepository: Repository<Album>,
    @InjectRepository(AlbumPlaylist)
    private readonly albumPlaylistRepository: Repository<AlbumPlaylist>,
    @InjectRepository(Playlist)
    private readonly playlistRepository: Repository<Playlist>,
    private cognitoService: CognitoService,
    @InjectRepository(UserFavorites)
    private readonly userFavoritesRepository: Repository<UserFavorites>,
    private storageService: StorageService,
    @InjectRepository(UserSetting)
    private readonly userSettingRepository: Repository<UserSetting>,
  ) {}

  async get(userId: string, queries: ApiBaseGetListQueries) {
    const search = queries.search;

    const { items, pagination } = await paginate(this.albumRepository, {
      params: queries,
      where: { createdBy: userId, ...(search ? { name: ILike(`%${search}%`) } : {}) },
    });

    const userInfo = await this.cognitoService.getUserByUserId(userId);

    const newItems = items.map((album) => {
      const firstPlaylist = album.albumPlaylists?.[0]?.playlist;
      const firstScent = firstPlaylist?.playlistScents?.[0]?.scent;

      return {
        id: album.id,
        name: album.name,
        image: album.image
          ? convertURLToS3Readable(album.image)
          : firstScent?.image
            ? convertURLToS3Readable(firstScent?.image)
            : '',
        createdBy: userInfo,
      };
    });

    return {
      items: newItems,
      pagination,
    };
  }

  async getPublic(queries: ApiBaseGetListQueries) {
    const { page, perPage, search } = queries;

    //Get list userId public
    const publicUsers = await this.userSettingRepository.find({
      where: { isPublic: true },
      select: ['userId'],
    });

    const publicUserIds = publicUsers.map((u) => u.userId);

    if (publicUserIds.length === 0) {
      return { items: [], pagination: { total: 0, page, perPage } };
    }

    const where: any = {
      createdBy: In(publicUserIds),
    };

    if (search) {
      where.name = ILike(`%${search}%`);
    }

    const { items, pagination } = await paginate(this.albumRepository, {
      where,
      params: queries,
    });

    const newItems = items.map((album) => {
      const firstPlaylist = album.albumPlaylists?.[0]?.playlist?.playlistScents?.[0]?.scent;

      return {
        id: album.id,
        name: album.name,
        image: album.image
          ? convertURLToS3Readable(album.image)
          : firstPlaylist?.image
            ? convertURLToS3Readable(firstPlaylist?.image)
            : '',
      };
    });

    return {
      items: newItems,
      pagination,
    };
  }

  async getById(albumId: string) {
    const album = await this.albumRepository.findOne({
      where: { id: albumId },
      relations: [
        'albumPlaylists',
        'albumPlaylists.playlist',
        'albumPlaylists.playlist.playlistScents',
        'albumPlaylists.playlist.playlistScents.scent',
      ],
    });

    if (!album) {
      throw new HttpException(MESSAGE.ALBUM.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const playlists = [];

    for (const ap of album.albumPlaylists) {
      const firstScent = ap.playlist.playlistScents?.[0]?.scent;

      const userInfo = await this.cognitoService.getUserByUserId(ap.playlist.createdBy);

      playlists.push({
        id: ap.playlist.id,
        name: ap.playlist.name,
        image: firstScent?.image ? convertURLToS3Readable(firstScent?.image) : '',
        createdBy: userInfo,
      });
    }

    const albumImage = album.image
      ? convertURLToS3Readable(album.image)
      : playlists[0]?.image || '';

    const userInfo = await this.cognitoService.getUserByUserId(album.createdBy);

    const favorite = await this.userFavoritesRepository.findOne({
      where: {
        userId: album.createdBy,
        type: FavoriteType.ALBUM,
        relationId: album.id,
      },
    });

    return {
      id: album.id,
      name: album.name,
      image: albumImage ? convertURLToS3Readable(albumImage) : '',
      createdBy: userInfo,
      playlists,
      isFavorite: !!favorite,
    };
  }

  async create(userId: string, body: CreateAlbumDto, file: Express.Multer.File) {
    const found = await this.albumRepository.findOne({
      where: { name: body.name, createdBy: userId },
    });

    if (found) {
      throw new HttpException(MESSAGE.ALBUM.ALREADY_EXISTS, HttpStatus.BAD_REQUEST);
    }

    let uploadedImageUrl = '';

    if (file) {
      const fileName = `albums/${Date.now()}`;
      const uploadedImage = await this.storageService.uploadImage(file, fileName);
      uploadedImageUrl = uploadedImage.fileName;
    }

    const album = this.albumRepository.create({
      ...body,
      image: uploadedImageUrl,
      createdBy: userId,
    });

    return this.albumRepository.save(album);
  }

  async update(userId: string, id: string, body: UpdateAlbumDto, file: Express.Multer.File) {
    const found = await this.albumRepository.findOne({
      where: { id, createdBy: userId },
    });

    if (!found) {
      throw new HttpException(MESSAGE.ALBUM.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const albumName = body.name || found.name;

    const existed = await this.albumRepository.findOne({
      where: { name: albumName, createdBy: userId },
    });

    if (existed && existed.id !== id) {
      throw new HttpException(MESSAGE.ALBUM.ALREADY_EXISTS, HttpStatus.BAD_REQUEST);
    }

    let image = found.image;

    if (file) {
      const fileName = `albums/${Date.now()}`;
      const uploadedImage = await this.storageService.uploadImage(file, fileName);

      image = uploadedImage.fileName;
    }

    return this.albumRepository.update(id, {
      image,
      name: albumName,
    });
  }

  async replace(userId: string, id: string, body: CreateAlbumDto, file: Express.Multer.File) {
    const found = await this.albumRepository.findOne({
      where: { id, createdBy: userId },
    });

    if (!found) {
      throw new HttpException(MESSAGE.ALBUM.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const existed = await this.albumRepository.findOne({
      where: { name: body.name, createdBy: userId },
    });

    if (existed && existed.id !== id) {
      throw new HttpException(MESSAGE.ALBUM.ALREADY_EXISTS, HttpStatus.BAD_REQUEST);
    }

    let image = found.image;

    if (file) {
      const fileName = `albums/${Date.now()}`;
      const uploadedImage = await this.storageService.uploadImage(file, fileName);

      image = uploadedImage.fileName;
    }

    return this.albumRepository.update(id, {
      image,
      name: body.name,
    });
  }

  async delete(userId: string, id: string) {
    const found = await this.albumRepository.findOne({
      where: { id, createdBy: userId },
    });

    if (!found) {
      throw new HttpException(MESSAGE.ALBUM.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    await this.albumPlaylistRepository.softDelete({ album: { id } });

    return this.albumRepository.softDelete(id);
  }

  async getAlbumPlaylists(userId: string, albumId: string, queries: ApiBaseGetListQueries) {
    const found = await this.albumRepository.findOne({
      where: { id: albumId, createdBy: userId },
    });

    if (!found) {
      throw new HttpException(MESSAGE.ALBUM.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const search = queries.search;

    const { items: albumPlaylists, pagination } = await paginate(this.albumPlaylistRepository, {
      where: {
        album: { id: albumId, createdBy: userId },
        ...(search ? { playlist: { name: ILike(`%${search}%`) } } : {}),
      },
      relations: ['playlist', 'playlist.playlistScents', 'playlist.playlistScents.scent'],
      params: queries,
    });

    const playlists = [];

    for (const ap of albumPlaylists) {
      const firstScent = ap.playlist.playlistScents?.[0]?.scent;

      const userInfo = await this.cognitoService.getUserByUserId(ap.playlist.createdBy);

      playlists.push({
        id: ap.playlist.id,
        name: ap.playlist.name,
        createdBy: userInfo,
        image: firstScent?.image ? convertURLToS3Readable(firstScent?.image) : '',
      });
    }

    return {
      items: playlists,
      pagination,
    };
  }

  async addPlaylistToAlbum(
    albumId: string,
    playlistId: string,
    userId: string,
  ): Promise<AlbumPlaylist> {
    const album = await this.albumRepository.findOne({ where: { id: albumId, createdBy: userId } });

    if (!album) {
      throw new HttpException(MESSAGE.ALBUM.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const playlist = await this.playlistRepository.findOne({
      where: { id: playlistId, createdBy: userId },
    });

    if (!playlist) {
      throw new HttpException(MESSAGE.PLAYLIST.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const record = this.albumPlaylistRepository.create({
      album,
      playlist,
      createdBy: userId,
    });

    return this.albumPlaylistRepository.save(record);
  }

  async removePlaylistFromAlbum(albumId: string, playlistId: string) {
    const album = await this.albumRepository.findOne({ where: { id: albumId } });

    if (!album) {
      throw new HttpException(MESSAGE.ALBUM.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const playlist = await this.playlistRepository.findOne({ where: { id: playlistId } });

    if (!playlist) {
      throw new HttpException(MESSAGE.PLAYLIST.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const result = await this.albumPlaylistRepository.softDelete({
      album: { id: albumId },
      playlist: { id: playlistId },
    });

    return result;
  }
}
