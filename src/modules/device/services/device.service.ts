import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { orderBy } from 'lodash';
import { Device, DeviceProvisioningStatus } from 'modules/device/entities/device.entity';
import { IsNull, Repository } from 'typeorm';

import { MESSAGE } from '../../../common/constants/message.constant';
import { Scent } from '../../../common/entities/scent.entity';
import { Space } from '../../../common/entities/space.entity';
import { Status, UserSession } from '../../../common/entities/user-session.entity';
import { RegisterDeviceDto } from '../dto';
import { DeviceCertificate } from '../entities/device-certificate.entity';
import { DeviceCommand } from '../entities/device-command.entity';
import { Product } from '../entities/product.entity';
import { AwsIotCoreService } from './aws-iot-core.service';
import { DeviceCertificateService } from './device-certificate.service';

@Injectable()
export class DeviceService {
  constructor(
    @InjectRepository(Device)
    private repository: Repository<Device>,
    private awsIotService: AwsIotCoreService,
    private deviceCertificateService: DeviceCertificateService,
    @InjectRepository(DeviceCertificate)
    private certificateRepository: Repository<DeviceCertificate>,
    @InjectRepository(Space)
    private spaceRepository: Repository<Space>,
    @InjectRepository(Scent)
    private scentRepository: Repository<Scent>,
    @InjectRepository(DeviceCommand)
    private deviceCommandRepository: Repository<DeviceCommand>,
    @InjectRepository(UserSession)
    private userSessionRepository: Repository<UserSession>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  /**
   * Update firmware version
   */
  async updateFirmwareVersion(deviceId: string, version: string): Promise<void> {
    const device = await this.repository.findOne({
      where: { id: deviceId },
    });

    if (!device) {
      throw new NotFoundException(`Device with ID ${deviceId} not found`);
    }

    device.firmwareVersion = version;
    await this.repository.save(device);
  }

  async provisionDevice(deviceId: string) {
    const device = await this.repository.findOne({
      where: { product: { serialNumber: deviceId } },
      relations: ['product'],
    });

    if (!device) {
      throw new NotFoundException(`Device ${deviceId} not found`);
    }

    try {
      // Create IoT Thing
      const thingName = deviceId;
      await this.awsIotService.createThing(thingName, {
        serialNumber: device.product?.serialNumber,
        productType: device.product?.type?.toString() || 'unknown',
      });

      // Create certificate
      const certResult = await this.deviceCertificateService.createDeviceCertificate(deviceId);

      // Attach certificate to thing
      await this.awsIotService.attachThingPolicy(thingName, certResult.certificate.certificateArn);

      // Update device
      device.thingName = thingName;
      device.provisioningStatus = DeviceProvisioningStatus.PROVISIONED;
      await this.repository.save(device);

      return {
        deviceId,
        thingName,
        certificateId: certResult.certificate.certificateId,
        certificateUrl: certResult.urls.certificateUrl,
        privateKey: certResult.urls.privateKeyUrl, // Return only once
      };
    } catch (error) {
      device.provisioningStatus = DeviceProvisioningStatus.FAILED;
      await this.repository.save(device);
      throw error;
    }
  }

  async getDeviceCertificates(deviceId: string) {
    return await this.certificateRepository.find({
      where: { device: { product: { serialNumber: deviceId } } },
      order: { createdAt: 'DESC' },
    });
  }

  // Core device operations
  async createDevice() {}
  async updateDevice() {}
  async deleteDevice() {}

  async getDevice(deviceId: string) {
    const device = await this.repository.findOne({
      where: { product: { serialNumber: deviceId } },
      relations: ['cartridges', 'certificates'],
    });

    if (!device) {
      throw new NotFoundException('Device not found');
    }

    return device;
  }

  async findValidDevice(deviceId: string) {
    const device = await this.repository.findOne({
      where: { product: { serialNumber: deviceId } },
    });

    if (!device) {
      throw new BadRequestException('Device not found');
    }

    if (device.provisioningStatus !== DeviceProvisioningStatus.PROVISIONED) {
      throw new BadRequestException('Device is not provisioned');
    }

    return device;
  }

  async getUserRegisteredDevices(userId: string) {
    const devices = await this.repository.find({
      where: { registeredBy: userId },
      relations: ['product', 'space'],
    });

    return devices.map((el) => ({
      ...el,
      spaceName: el.space ? el.space.name : null,
    }));
  }

  async registerDevice(dto: RegisterDeviceDto, userId: string) {
    const product = await this.productRepository.findOne({
      where: { serialNumber: dto.deviceId },
    });

    if (!product) {
      throw new HttpException(MESSAGE.DEVICE.NOT_FOUND, HttpStatus.BAD_REQUEST);
    }

    const device = await this.repository.findOne({
      where: { product: { serialNumber: dto.deviceId } },
    });

    if (!device) {
      const newDevice = this.repository.create({
        product: { serialNumber: dto.deviceId },
        name: product.name,
        isConnected: true,
        registeredBy: userId,
        provisioningStatus: DeviceProvisioningStatus.PROVISIONED,
      });

      return await this.repository.save(newDevice);
    }

    if (device.provisioningStatus !== DeviceProvisioningStatus.PROVISIONED) {
      throw new BadRequestException('Device is not provisioned');
    }

    if (device.registeredBy === userId) {
      return device;
    } else if (device.registeredBy) {
      throw new ForbiddenException('Device is already registered to another user');
    }

    const lastPing = device.lastPingAt;

    if (!lastPing) {
      throw new BadRequestException('Device is not responding');
    }
    // if (!lastPing || Date.now() - lastPing.getTime() > 10 * 60 * 1000) {
    //   throw new BadRequestException('Device is not responding');
    // }

    await this.repository.update(device.id, { registeredBy: userId });

    return Object.assign(device, { registeredBy: userId });
  }

  async unregisterDevice(dto: RegisterDeviceDto, userId: string) {
    const device = await this.findValidDevice(dto.deviceId);

    if (device.registeredBy !== userId) {
      throw new ForbiddenException('Device is already registered to another user');
    }

    await this.repository.update(device.id, { registeredBy: null });

    return Object.assign(device, { registeredBy: null });
  }

  async connectSpace(userId: string, deviceId: string, spaceId: string) {
    const device = await this.findValidDevice(deviceId);

    if (!device) {
      throw new HttpException(MESSAGE.DEVICE.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const space = await this.spaceRepository.findOne({
      where: { id: spaceId },
    });

    if (!space) {
      throw new HttpException(MESSAGE.SPACE.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const connectedDevice = await this.repository.update(device.id, {
      space: { id: space.id },
      isConnected: true,
      registeredBy: userId,
    });

    return connectedDevice;
  }

  async updateDeviceStatus(deviceId: string, isConnected: boolean) {
    const device = await this.findValidDevice(deviceId);

    if (!device) {
      throw new HttpException(MESSAGE.DEVICE.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const updatedDevice = await this.repository.update(device.id, {
      isConnected,
    });

    return updatedDevice;
  }

  async validateDeviceOwnership(deviceId: string, userId: string): Promise<Device> {
    const device = await this.repository.findOne({
      where: { product: { serialNumber: deviceId } },
    });

    if (!device) {
      throw new HttpException(MESSAGE.DEVICE.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (device.registeredBy !== userId) {
      throw new HttpException(MESSAGE.DEVICE.FORBIDDEN, HttpStatus.FORBIDDEN);
    }

    return device;
  }

  async removeDeviceFromSpace(userId: string, deviceId: string) {
    const device = await this.validateDeviceOwnership(deviceId, userId);

    if (!device) {
      throw new HttpException(MESSAGE.DEVICE.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const removedDevice = await this.repository.update(device.id, {
      space: null,
      isConnected: false,
    });

    return removedDevice;
  }

  async removeDevice(userId: string, deviceId: string) {
    const device = await this.validateDeviceOwnership(deviceId, userId);

    if (!device) {
      throw new HttpException(MESSAGE.DEVICE.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const removedDevice = await this.repository.softDelete(device.id);

    return removedDevice;
  }

  async switchSpace(userId: string, deviceId: string, spaceId: string) {
    const device = await this.validateDeviceOwnership(deviceId, userId);

    if (!device) {
      throw new HttpException(MESSAGE.DEVICE.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const space = await this.spaceRepository.findOne({
      where: { id: spaceId, createdBy: userId },
    });

    if (!space) {
      throw new HttpException(MESSAGE.SPACE.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const updatedDevice = await this.repository.update(device.id, {
      space: { id: space.id },
    });

    return updatedDevice;
  }

  async getDeviceDetail(deviceId: string) {
    const device = await this.repository.findOne({
      where: { product: { serialNumber: deviceId } },
      relations: ['product', 'cartridges', 'cartridges.product', 'space'],
    });

    if (!device) {
      throw new HttpException(MESSAGE.DEVICE.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    return {
      id: device.id,
      name: device.name,
      deviceId: device.product.serialNumber,
      isConnected: device.isConnected,
      warranty: device.warrantyExpirationDate,
      productInfo: {
        serialNumber: device.product.serialNumber,
        sku: device.product.sku,
        batch: device.product.batchId,
      },
      cartridges: orderBy(
        device.cartridges.map((cartridge) => ({
          id: cartridge.id,
          name: cartridge.product.name,
          percentage: Number(cartridge.percentage),
          position: Number(cartridge.position),
        })),
        ['position'],
        ['asc'],
      ),
      spaceName: device.space?.name,
    };
  }

  async queueCommand(
    deviceId: string,
    userId: string,
    commandType: 'play' | 'pause',
    status: Status,
    scentId: string,
  ) {
    const device = await this.findValidDevice(deviceId);
    if (!device) {
      throw new HttpException(MESSAGE.DEVICE.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const scent = await this.scentRepository.findOne({
      where: { id: scentId },
    });
    if (!scent) {
      throw new HttpException(MESSAGE.SCENT_MOBILE.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    let command = await this.deviceCommandRepository.findOne({
      where: {
        device: { id: device.id },
        isExecuted: false,
        deletedAt: IsNull(),
      },
      order: { createdAt: 'DESC' },
    });

    if (command) {
      command.command = commandType;
      command.updatedAt = new Date();
      await this.deviceCommandRepository.save(command);
    } else {
      command = this.deviceCommandRepository.create({
        device: { id: device.id },
        command: commandType,
        isExecuted: false,
      });
      await this.deviceCommandRepository.save(command);
    }

    const userSession = this.userSessionRepository.create({
      device: { id: device.id },
      userId,
      scent: { id: scent.id },
      status,
    });

    await this.userSessionRepository.save(userSession);

    return command;
  }
}
