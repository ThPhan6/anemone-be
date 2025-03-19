import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';

import { BaseEntity } from './base.entity';
import { Device } from './device.entity';
import { Product } from './product.entity';

@Entity('device_cartridges')
export class DeviceCartridge extends BaseEntity {
  @Column({ name: 'eot', type: 'bigint' })
  eot: number;

  @Column({ name: 'ert', type: 'bigint' })
  ert: number;

  @OneToOne(() => Product)
  @JoinColumn({ name: 'serial_number' })
  serialNumber: string;

  @Column({ name: 'percentage', type: 'numeric' })
  percentage: number;

  @Column({ name: 'position', type: 'numeric' })
  position: number;

  @ManyToOne(() => Device, (device) => device.cartridges)
  @JoinColumn({ name: 'device_id' })
  device: Device;
}
