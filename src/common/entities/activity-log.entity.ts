import { Column, CreateDateColumn, Entity } from 'typeorm';

import { AutoUUIDEntity } from './entity';

export enum ActivityAction {
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  SETTINGS_CHANGE = 'SETTINGS_CHANGE',
  DEVICE_PAIR = 'DEVICE_PAIR',
  DEVICE_UNPAIR = 'DEVICE_UNPAIR',
  PLAYLIST_CREATE = 'PLAYLIST_CREATE',
}

@Entity('activity_logs')
export class ActivityLog extends AutoUUIDEntity {
  @Column({ name: 'user_id' })
  userId: string;

  @Column({
    name: 'entity_id',
    type: 'uuid',
  })
  public entityId: string;

  @Column({
    name: 'entity',
    length: 64,
  })
  public entity: string;

  @Column()
  public action: ActivityAction;

  @Column({ type: 'json', name: 'old_data' })
  public oldData: Record<string, any>;

  @Column({ type: 'json', name: 'new_data' })
  public newData: Record<string, any>;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  public createdAt: Date;
}
