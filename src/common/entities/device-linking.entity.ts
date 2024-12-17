import { Entity, JoinColumn, ManyToOne } from 'typeorm';

import { BaseEntity } from './base.entity';
import { Device } from './device.entity';

@Entity('device_links')
export class DeviceLink extends BaseEntity {
  @ManyToOne(() => Device)
  @JoinColumn({ name: 'device_id' })
  public device: Device;

  @ManyToOne(() => Device)
  @JoinColumn({ name: 'linking_id' })
  public linking: Device;
}
