import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FavoriteType, UserFavorites } from 'common/entities/user-favorites.entity';
import { In, Repository } from 'typeorm';

import { Album } from '../../common/entities/album.entity';
import { convertURLToS3Readable } from '../../common/utils/file';
import { CognitoService } from '../auth/cognito.service';
import { CreateUserFavoriteDto } from './dto/request.dto';

@Injectable()
export class UserFavoritesService {
  constructor(
    @InjectRepository(UserFavorites)
    private readonly userFavoritesRepository: Repository<UserFavorites>,
    @InjectRepository(Album)
    private readonly albumRepository: Repository<Album>,
    private cognitoService: CognitoService,
  ) {}

  async get(userId: string, type: FavoriteType) {
    const favorites = await this.userFavoritesRepository.find({
      where: {
        userId,
        type,
      },
    });

    const relationIds = favorites.map((favorite) => favorite.relationId);

    const results = [];

    if (type === FavoriteType.ALBUM) {
      const reponse = await this.albumRepository.find({
        where: {
          id: In(relationIds),
        },
        relations: [
          'albumPlaylists',
          'albumPlaylists.playlist',
          'albumPlaylists.playlist.playlistScents',
          'albumPlaylists.playlist.playlistScents.scent',
        ],
      });

      for (const album of reponse) {
        const userInfo = await this.cognitoService.getUserByUserId(album.createdBy);

        const firstPlaylist = album.albumPlaylists?.[0]?.playlist;

        const firstScent = firstPlaylist?.playlistScents?.[0]?.scent;

        results.push({
          id: album.id,
          name: album.name,
          image: firstScent?.image ? convertURLToS3Readable(firstScent?.image) : '',
          createdBy: userInfo,
        });
      }
    }

    return results;
  }

  async create(userId: string, body: CreateUserFavoriteDto) {
    const userFavorite = this.userFavoritesRepository.create({
      userId,
      ...body,
    });

    await this.userFavoritesRepository.save(userFavorite);

    return userFavorite;
  }

  async delete(userId: string, relationId: string) {
    const favorite = await this.userFavoritesRepository.findOne({
      where: {
        userId,
        relationId,
      },
    });

    if (!favorite) {
      throw new HttpException('Item not found', HttpStatus.NOT_FOUND);
    }

    return await this.userFavoritesRepository.softDelete({
      userId,
      relationId,
    });
  }
}
