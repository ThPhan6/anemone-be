import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { Album } from '../../common/entities/album.entity';
import { Playlist } from '../../common/entities/playlist.entity';
import { UserSetting } from '../../common/entities/user-setting.entity';
import { convertURLToS3Readable } from '../../common/utils/file';
import { ApiBaseGetListQueries } from '../../core/types/apiQuery.type';

@Injectable()
export class UnifiedSearchService {
  constructor(
    @InjectRepository(UserSetting)
    private userSettingRepository: Repository<UserSetting>,
    private readonly dataSource: DataSource,
  ) {}

  async searchAllFlat(queries: ApiBaseGetListQueries) {
    const { search = '', page = 1, limit = 10 } = queries;

    const publicUserIds = (
      await this.userSettingRepository.find({
        where: { isPublic: true },
        select: ['userId'],
      })
    ).map((u) => u.userId);

    if (!publicUserIds.length) {
      return {
        data: [],
        pagination: { total: 0, page, perPage: limit },
      };
    }

    const offset = (page - 1) * limit;

    const keywordParam = `%${search?.toLowerCase() || ''}%`;

    //  Query data from 3 tables by UNION ALL
    //    - Find by name (ILIKE)
    //    - Combine data of scents, albums, playlists
    const rawData = await this.dataSource.query(
      `
      (
        SELECT id, name, image, 'scent' AS type
        FROM scents
        WHERE created_by = ANY($1) AND name ILIKE $2 AND deleted_at IS NULL
      )
      UNION ALL
      (
        SELECT id, name, image, 'album' AS type
        FROM albums
        WHERE created_by = ANY($1) AND name ILIKE $2 AND deleted_at IS NULL
      )
      UNION ALL
      (
        SELECT id, name, image, 'playlist' AS type
        FROM playlists
        WHERE created_by = ANY($1) AND name ILIKE $2 AND deleted_at IS NULL
      )
      ORDER BY name
      LIMIT $3 OFFSET $4
    `,
      [publicUserIds, keywordParam, limit, offset],
    );

    // Get total count for pagination
    const totalResult = await this.dataSource.query(
      `
      SELECT COUNT(*) FROM (
        SELECT id FROM scents WHERE created_by = ANY($1) AND name ILIKE $2 AND deleted_at IS NULL
        UNION ALL
        SELECT id FROM albums WHERE created_by = ANY($1) AND name ILIKE $2 AND deleted_at IS NULL
        UNION ALL
        SELECT id FROM playlists WHERE created_by = ANY($1) AND name ILIKE $2 AND deleted_at IS NULL
    ) AS total
  `,
      [publicUserIds, keywordParam],
    );

    const total = parseInt(totalResult[0].count, 10);

    const enriched: any[] = [];

    //Loop through each result to handle fallback image if no image
    for (const item of rawData) {
      let image = item.image;

      if (!image) {
        //Fallback image for album
        if (item.type === 'album') {
          const album = await this.dataSource.getRepository(Album).findOne({
            where: { id: item.id },
            relations: [
              'albumPlaylists',
              'albumPlaylists.playlist',
              'albumPlaylists.playlist.playlistScents',
              'albumPlaylists.playlist.playlistScents.scent',
            ],
          });

          const fallback = album?.albumPlaylists?.[0]?.playlist?.playlistScents?.[0]?.scent;
          image = fallback?.image;
        }

        //Fallback image for playlist
        if (item.type === 'playlist') {
          const playlist = await this.dataSource.getRepository(Playlist).findOne({
            where: { id: item.id },
            relations: ['playlistScents', 'playlistScents.scent'],
          });

          const fallback = playlist?.playlistScents?.[0]?.scent;
          image = fallback?.image;
        }
      }

      enriched.push({
        id: item.id,
        name: item.name,
        type: item.type,
        image: image ? convertURLToS3Readable(image) : '',
      });
    }

    return {
      items: enriched,
      pagination: {
        total,
        page,
        perPage: limit,
      },
    };
  }
}
