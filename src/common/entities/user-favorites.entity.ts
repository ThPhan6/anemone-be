import { BaseEntity } from 'common/entities/base.entity';
import { Column, Entity } from 'typeorm';

export enum FavoriteType {
  SCENT = 'scent',
  ALBUM = 'album',
  PLAYLIST = 'playlist',
}

@Entity('user_favorites')
export class UserFavorites extends BaseEntity {
  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'type' })
  type: FavoriteType;

  @Column({ name: 'relation_id' })
  relationId: string;
}
