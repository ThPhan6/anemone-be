import { Entity, JoinColumn, ManyToOne } from 'typeorm';

import { BaseEntityNumberId } from './base.entity';
import { Device } from './device.entity';
import { User } from './user.entity';

@Entity('user_devices')
export class UserDevice extends BaseEntityNumberId {
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  public user: User;

  @ManyToOne(() => Device)
  @JoinColumn({ name: 'device_id' })
  public device: Device;
}
