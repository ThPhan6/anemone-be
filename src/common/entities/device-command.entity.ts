import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { BaseEntity } from './base.entity';
import { Device } from './device.entity';

@Entity('device_commands')
export class DeviceCommand extends BaseEntity {
  @ManyToOne(() => Device)
  @JoinColumn({ name: 'device_id' })
  device: Device;

  @Column({ name: 'command' })
  command: string;
}
