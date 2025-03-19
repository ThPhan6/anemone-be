import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { BaseEntity } from './base.entity';
import { User } from './user.entity';

@Entity('user_settings')
export class UserSetting extends BaseEntity {
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'schedule_timer', type: 'json', nullable: true })
  scheduleTimer: any;

  @Column({ name: 'system', type: 'json', nullable: true })
  system: any;

  @Column({ name: 'device', type: 'json', nullable: true })
  device: any;

  @Column({ name: 'network', type: 'json', nullable: true })
  network: any;

  @Column({ name: 'system_update', type: 'json', nullable: true })
  systemUpdate: any;

  @Column({ name: 'wifi_enabled', default: false })
  wifiEnabled: boolean;

  @Column({ name: 'wifi_connections', type: 'json', nullable: true })
  wifiConnections: any;

  @Column({ name: 'personalise', default: false })
  personalise: boolean;
}
