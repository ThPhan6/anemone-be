import { Entity, JoinColumn, ManyToOne } from 'typeorm';

import { BaseEntity } from './base.entity';
import { Device } from './device.entity';
import { Scent } from './scent.entity';

@Entity('device_scents')
export class DeviceScent extends BaseEntity {
  @ManyToOne(() => Device)
  @JoinColumn({ name: 'device_id' })
  public device: Device;

  @ManyToOne(() => Scent)
  @JoinColumn({ name: 'scent_id' })
  public scent: Scent;
}
