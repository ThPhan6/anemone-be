import { Injectable } from '@nestjs/common';
import { In } from 'typeorm';

import { Album } from '../../common/entities/album.entity';
import { AlbumRepository } from '../../common/repositories/album.repository';
import { AlbumPlaylistRepository } from '../../common/repositories/album-playlist.repository';
import { PlaylistRepository } from '../../common/repositories/playlist-repository';
import { UserRepository } from '../../common/repositories/user.repository';
import { UserSessionRepository } from '../../common/repositories/user-session.repository';
import { transformImageUrls } from '../../common/utils/helper';
import { BaseService } from '../../core/services/base.service';
import { ApiGetListQueries } from '../../core/types/apiQuery.type';
import { Pagination } from '../../core/types/response.type';
import { CognitoService } from '../auth/cognito.service';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class AlbumAdminService extends BaseService<Album> {
  constructor(
    private readonly albumRepository: AlbumRepository,
    private readonly albumPlaylistRepository: AlbumPlaylistRepository,
    private readonly playlistRepository: PlaylistRepository,
    private readonly userSessionRepository: UserSessionRepository,
    private readonly userRepository: UserRepository,
    private readonly cognitoService: CognitoService,
    private readonly storageService: StorageService,
  ) {
    super(albumRepository);
  }

  async findAll(query: ApiGetListQueries): Promise<Pagination<Album>> {
    const albumRes = await super.findAll(
      query,
      {
        albumPlaylists: true,
      },
      ['name'],
    );

    const userIds = albumRes.items.map((item) => item.createdBy);
    const users = await this.userSessionRepository.find({
      where: { userId: In(userIds) },
    });

    const albums = albumRes.items.map((item) => {
      const user = users.find((user) => user.userId === item.createdBy);

      if (user) {
        return {
          ...item,
          user,
        };
      }

      return item;
    });

    albumRes.items = albums;

    return transformImageUrls(albumRes);
  }
}
