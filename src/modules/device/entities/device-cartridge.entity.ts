import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { BaseEntity } from '../../../common/entities/base.entity';
import { Device } from './device.entity';
import { Product } from './product.entity';

@Entity('device_cartridges')
export class DeviceCartridge extends BaseEntity {
  @Column({ name: 'eot', type: 'bigint' })
  eot: number;

  @Column({ name: 'ert', type: 'bigint' })
  ert: number;

  @ManyToOne(() => Product, (product) => product.cartridges)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ name: 'serial_number' })
  serialNumber: string;

  @Column({ name: 'percentage', type: 'numeric' })
  percentage: number;

  @Column({ name: 'position', type: 'numeric' })
  position: number;

  @ManyToOne(() => Device, (device) => device.cartridges)
  @JoinColumn({ name: 'device_id' })
  device: Device;
}
