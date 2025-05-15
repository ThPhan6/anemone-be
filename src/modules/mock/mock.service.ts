import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MESSAGE } from '../../common/constants/message.constant';
import { Device, DeviceProvisioningStatus } from '../device/entities/device.entity';
import { DeviceCartridge } from '../device/entities/device-cartridge.entity';
import { Product, ProductType } from '../device/entities/product.entity';
import { ProductVariant } from '../product-variant/entities/product-variant.entity';
import { ScentConfig } from '../system/entities/scent-config.entity';
@Injectable()
export class MockService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Device)
    private readonly deviceRepository: Repository<Device>,
    @InjectRepository(DeviceCartridge)
    private readonly deviceCartridgeRepository: Repository<DeviceCartridge>,
    @InjectRepository(ScentConfig)
    private readonly scentConfigRepository: Repository<ScentConfig>,
    @InjectRepository(ProductVariant)
    private readonly productVariantRepository: Repository<ProductVariant>,
  ) {}

  generateRandomSerialNumber(prefix = 'SN', digits = 9): string {
    const randomNumber = Math.floor(Math.random() * Math.pow(10, digits));

    return `${prefix}${randomNumber.toString().padStart(digits, '0')}`;
  }

  async mockDeviceWithCartridges(userId: string, deviceName: string) {
    const productVariants = await this.productVariantRepository.find();

    // Get a random product variant for the device
    const randomProductVariant =
      productVariants.length > 0
        ? productVariants[Math.floor(Math.random() * productVariants.length)]
        : null;

    const deviceOrCartridges = [
      {
        manufacturerId: 'vitruvi',
        sku: 'SKU-001',
        batchId: 'BATCH-02-2025',
        serialNumber: this.generateRandomSerialNumber(),
        name: deviceName,
        productVariantId: randomProductVariant?.id,
        type: ProductType.DEVICE,
      },
      {
        name: 'S01',
        sku: 'SKU-001',
        batchId: 'BATCH-02-2025',
        serialNumber: this.generateRandomSerialNumber(),
        type: ProductType.CARTRIDGE,
      },
      {
        name: 'R01',
        sku: 'SKU-001',
        batchId: 'BATCH-02-2025',
        serialNumber: this.generateRandomSerialNumber(),
        type: ProductType.CARTRIDGE,
      },
      {
        name: 'I01',
        sku: 'SKU-001',
        batchId: 'BATCH-02-2025',
        serialNumber: this.generateRandomSerialNumber(),
        type: ProductType.CARTRIDGE,
      },
      {
        name: 'H01',
        sku: 'SKU-001',
        batchId: 'BATCH-02-2025',
        serialNumber: this.generateRandomSerialNumber(),
        type: ProductType.CARTRIDGE,
      },
      {
        name: 'F01',
        sku: 'SKU-001',
        batchId: 'BATCH-02-2025',
        serialNumber: this.generateRandomSerialNumber(),
        type: ProductType.CARTRIDGE,
      },
      {
        name: 'E01',
        sku: 'SKU-001',
        batchId: 'BATCH-02-2025',
        serialNumber: this.generateRandomSerialNumber(),
        type: ProductType.CARTRIDGE,
      },
    ];

    const scentConfigs = await this.scentConfigRepository.find();

    let scentConfigIndex = 0;

    const savedProducts: Product[] = [];
    //create product
    for (const item of deviceOrCartridges) {
      let scentConfig: ScentConfig | undefined = undefined;

      if (item.type === ProductType.CARTRIDGE) {
        scentConfig = scentConfigs[scentConfigIndex];
        scentConfigIndex++;

        // if out of scentConfigs, reset or stop
        if (!scentConfig) {
          throw new Error(`Not enough scentConfigs to assign to cartridges`);
        }
      }

      const product = this.productRepository.create({
        manufacturerId: item.manufacturerId || '',
        sku: item.sku || '',
        batchId: item.batchId || '',
        serialNumber: item.serialNumber,
        name: item.name,
        type: item.type,
        configTemplate: {},
        supportedFeatures: [],
        scentConfig,
        productVariant: { id: item.productVariantId },
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

    return {
      id: device.id,
      name: device.name,
      deviceId: device.product.serialNumber,
      thingName: device.thingName,
      provisioningStatus: device.provisioningStatus,
      firmwareVersion: device.firmwareVersion,
      isConnected: device.isConnected,
      lastPingAt: device.lastPingAt,
      warrantyExpirationDate: device.warrantyExpirationDate,
      registeredBy: device.registeredBy,
    };
  }
}
