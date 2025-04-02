import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Device, DeviceProvisioningStatus } from 'modules/device/entities/device.entity';
import { Repository } from 'typeorm';

import { MESSAGE } from '../../../common/constants/message.constant';
import { Space } from '../../../common/entities/space.entity';
import { RegisterDeviceDto } from '../dto';
import { DeviceCertificate } from '../entities/device-certificate.entity';
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
      where: { deviceId },
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
      where: { device: { deviceId } },
      order: { createdAt: 'DESC' },
    });
  }

  // Core device operations
  async createDevice() {}
  async updateDevice() {}
  async deleteDevice() {}

  async getDevice(deviceId: string) {
    const device = await this.repository.findOne({
      where: { deviceId },
      relations: ['cartridges', 'certificates'],
    });

    if (!device) {
      throw new NotFoundException('Device not found');
    }

    return device;
  }

  async findValidDevice(deviceId: string) {
    const device = await this.repository.findOne({
      where: { deviceId },
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
      relations: ['product'],
    });

    return devices;
  }

  async registerDevice(dto: RegisterDeviceDto, userId: string) {
    const device = await this.findValidDevice(dto.deviceId);

    if (!device) {
      throw new BadRequestException('Device not found');
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

  async disconnectSpace(deviceId: string) {
    const device = await this.findValidDevice(deviceId);

    if (!device) {
      throw new HttpException(MESSAGE.DEVICE.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const disconnectedDevice = await this.repository.update(device.id, {
      isConnected: false,
    });

    return disconnectedDevice;
  }

  async removeSpace(deviceId: string) {
    const device = await this.findValidDevice(deviceId);

    if (!device) {
      throw new HttpException(MESSAGE.DEVICE.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const removedDevice = await this.repository.update(device.id, {
      space: null,
      isConnected: false,
      registeredBy: null,
    });

    return removedDevice;
  }
}
