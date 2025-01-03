import { Entity, JoinColumn, ManyToOne } from 'typeorm';

import { BaseEntityNumberId } from './base.entity';
import { Device } from './device.entity';

@Entity('device_links')
export class DeviceLink extends BaseEntityNumberId {
  @ManyToOne(() => Device)
  @JoinColumn({ name: 'device_id' })
  public device: Device;

  @ManyToOne(() => Device)
  @JoinColumn({ name: 'linking_id' })
  public linking: Device;
}
