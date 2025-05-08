import { Column, Entity } from 'typeorm';

import { BaseEntity } from './base.entity';

@Entity('user_settings')
export class UserSetting extends BaseEntity {
  @Column({ name: 'user_id' })
  userId: string;

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

  @Column({ name: 'is_public', default: false })
  isPublic: boolean;

  @Column({ name: 'follower_access', default: false })
  followerAccess: boolean;

  @Column({ name: 'onboarded', default: false })
  onboarded: boolean;

  @Column({ name: 'questionnaire', type: 'json', nullable: true })
  questionnaire: any;
}
