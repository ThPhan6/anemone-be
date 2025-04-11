import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MESSAGE } from '../../common/constants/message.constant';
import { Device, DeviceProvisioningStatus } from '../device/entities/device.entity';
import { DeviceCartridge } from '../device/entities/device-cartridge.entity';
import { Product, ProductType } from '../device/entities/product.entity';
@Injectable()
export class MockService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Device)
    private readonly deviceRepository: Repository<Device>,
    @InjectRepository(DeviceCartridge)
    private readonly deviceCartridgeRepository: Repository<DeviceCartridge>,
  ) {}

  async mockDeviceWithCartridges(userId: string, deviceName: string) {
    const deviceOrCartridges = [
      {
        manufacturerId: 'vitruvi',
        sku: 'SKU-001',
        batchId: 'BATCH-02-2025',
        serialNumber: 'SN01111111',
        name: deviceName,
        type: ProductType.DEVICE,
      },
      {
        name: 'S01',
        serialNumber: 'SN000000002',
        type: ProductType.CARTRIDGE,
      },
      {
        name: 'R01',
        serialNumber: 'SN000000003',
        type: ProductType.CARTRIDGE,
      },
      {
        name: 'I01',
        serialNumber: 'SN000000004',
        type: ProductType.CARTRIDGE,
      },
      {
        name: 'H01',
        serialNumber: 'SN000000005',
        type: ProductType.CARTRIDGE,
      },
      {
        name: 'F01',
        serialNumber: 'SN000000006',
        type: ProductType.CARTRIDGE,
      },
      {
        name: 'E01',
        serialNumber: 'SN000000007',
        type: ProductType.CARTRIDGE,
      },
    ];

    const savedProducts: Product[] = [];
    //create product
    for (const item of deviceOrCartridges) {
      const product = this.productRepository.create({
        manufacturerId: item.manufacturerId || '',
        sku: item.sku || '',
        batchId: item.batchId || '',
        serialNumber: item.serialNumber,
        name: item.name,
        type: item.type,
        configTemplate: {},
        supportedFeatures: [],
      });

      await this.productRepository.save(product);

      savedProducts.push(product);
    }

    //create device
    const deviceProduct = savedProducts.find((p) => p.type === ProductType.DEVICE);

    if (!deviceProduct) {
      throw new HttpException(MESSAGE.DEVICE.NOT_FOUND, HttpStatus.BAD_REQUEST);
    }

    const device = this.deviceRepository.create({
      name: deviceProduct.name,
      deviceId: deviceProduct.serialNumber,
      thingName: `thing-${deviceProduct.serialNumber}`,
      provisioningStatus: DeviceProvisioningStatus.PROVISIONED,
      firmwareVersion: '1.0.0',
      isConnected: false,
      lastPingAt: new Date(),
      warrantyExpirationDate: new Date(Date.now() + 365 * 24 * 3600 * 1000),
      product: deviceProduct,
      registeredBy: userId,
    });

    await this.deviceRepository.save(device);

    const cartridges = savedProducts.filter((p) => p.type === ProductType.CARTRIDGE);

    //create device cartridges
    for (let i = 0; i < cartridges.length; i++) {
      // Random EOT from 1 to 10 hours (in milliseconds)
      const eotHours = Math.floor(Math.random() * 10) + 1;
      const eot = eotHours * 60 * 60 * 1000;

      // Random ERT from 0 to EOT
      const ert = Math.floor(Math.random() * eot);

      const percentage = Math.floor((ert / eot) * 100);

      const cart = this.deviceCartridgeRepository.create({
        eot,
        ert,
        product: cartridges[i],
        serialNumber: cartridges[i].serialNumber,
        percentage,
        position: i + 1,
        device: device,
      });

      await this.deviceCartridgeRepository.save(cart);
    }
  }
}
