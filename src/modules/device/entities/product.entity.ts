import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

import { BaseEntity } from '../../../common/entities/base.entity';
import { Category } from '../../../common/entities/category.entity';
import { Device } from './device.entity';
import { DeviceCartridge } from './device-cartridge.entity';

export enum ProductType {
  DEVICE = 0,
  CARTRIDGE = 1,
}

@Entity('products')
export class Product extends BaseEntity {
  @Column({ name: 'manufacturer_id' })
  manufacturerId: string;

  @Column({ name: 'sku' })
  sku: string;

  @Column({ name: 'batch_id' })
  batchId: string;

  @Column({ name: 'serial_number', unique: true, type: 'varchar' })
  serialNumber: string;

  @Column({ name: 'name' })
  name: string;

  @Column({ name: 'type', type: 'smallint' })
  type: ProductType;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ name: 'config_template', type: 'json', nullable: true })
  configTemplate: Record<string, any>;

  @Column({ name: 'supported_features', type: 'json', nullable: true })
  supportedFeatures: string[];

  @OneToMany(() => DeviceCartridge, (cartridge) => cartridge.product)
  cartridges: DeviceCartridge[];

  @OneToMany(() => Device, (device) => device.product)
  devices: Device[];
}
