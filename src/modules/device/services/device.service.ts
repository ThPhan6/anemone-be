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
import {
  ConnectionStatus,
  Device,
  DeviceProvisioningStatus,
} from 'modules/device/entities/device.entity';
import { In, IsNull, Repository } from 'typeorm';

import { MESSAGE } from '../../../common/constants/message.constant';
import { Scent } from '../../../common/entities/scent.entity';
import { Space } from '../../../common/entities/space.entity';
import { Status, UserSession } from '../../../common/entities/user-session.entity';
import { convertURLToS3Readable } from '../../../common/utils/file';
import { formatDeviceName } from '../../../common/utils/helper';
import { ProductVariant } from '../../product-variant/entities/product-variant.entity';
import { RegisterDeviceDto, UpdateDeviceDto } from '../dto';
import { DeviceCartridge } from '../entities/device-cartridge.entity';
import { DeviceCertificate } from '../entities/device-certificate.entity';
import { CommandType, DeviceCommand } from '../entities/device-command.entity';
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
    @InjectRepository(DeviceCartridge)
    private deviceCartridgeRepository: Repository<DeviceCartridge>,
    @InjectRepository(ProductVariant)
    private productVariantRepository: Repository<ProductVariant>,
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
      relations: ['product', 'space', 'product.productVariant'],
      order: { createdAt: 'DESC' },
    });

    return devices.map((el) => ({
      ...el,
      spaceName: el.space ? el.space.name : null,
      product: {
        ...el.product,
        image: el.product.productVariant.image
          ? convertURLToS3Readable(el.product.productVariant.image)
          : null,
      },
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
      relations: ['product'],
    });

    if (!device) {
      const newDevice = this.repository.create({
        product: { serialNumber: dto.deviceId },
        name: formatDeviceName(product.serialNumber),
        connectionStatus: ConnectionStatus.CONNECTED,
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

    await this.repository.update(device.id, {
      registeredBy: userId,
      createdAt: new Date(),
    });

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

  async removeDevice(userId: string, deviceId: string) {
    const device = await this.validateDeviceOwnership(deviceId, userId);

    const updatePayload = {
      isConnected: false,
      registeredBy: null,
      space: null,
      lastPingAt: null,
    };

    const removedDevice = await this.repository.update(device.id, updatePayload);

    await this.userSessionRepository.delete({ device: { id: device.id } });

    return removedDevice;
  }

  async updateDevice(userId: string, deviceId: string, dto: UpdateDeviceDto) {
    const device = await this.validateDeviceOwnership(deviceId, userId);

    const updatePayload: Partial<Device> = {};

    //check if spaceId is in the dto (includes null)
    if ('spaceId' in dto) {
      if (dto.spaceId) {
        const space = await this.spaceRepository.findOne({
          where: { id: dto.spaceId, createdBy: userId },
        });

        if (!space) {
          throw new HttpException(MESSAGE.SPACE.NOT_FOUND, HttpStatus.NOT_FOUND);
        }

        updatePayload.space = space;
        updatePayload.registeredBy = userId;
        updatePayload.connectionStatus = ConnectionStatus.CONNECTED;
      } else {
        updatePayload.space = null;
        updatePayload.connectionStatus = ConnectionStatus.DISCONNECTED_BY_DEVICE;
      }
    }

    if ('isConnected' in dto) {
      updatePayload.connectionStatus = dto.isConnected
        ? ConnectionStatus.CONNECTED
        : ConnectionStatus.DISCONNECTED_BY_USER;
    }

    return this.repository.update(device.id, updatePayload);
  }

  async getDeviceDetail(deviceId: string) {
    const device = await this.repository.findOne({
      where: { product: { serialNumber: deviceId } },
      relations: [
        'product',
        'cartridges',
        'cartridges.product',
        'cartridges.product.scentConfig',
        'space',
        'product.productVariant',
      ],
    });

    if (!device) {
      throw new HttpException(MESSAGE.DEVICE.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    return {
      id: device.id,
      name: device.name,
      deviceId: device.product.serialNumber,
      isConnected: device.connectionStatus === ConnectionStatus.CONNECTED,
      warranty: device.warrantyExpirationDate,
      productInfo: {
        serialNumber: device.product.serialNumber,
        batch: device.product.batchId,
        image: device.product.productVariant.image
          ? convertURLToS3Readable(device.product.productVariant.image)
          : null,
      },
      cartridges: orderBy(
        device.cartridges.map((cartridge) => ({
          id: cartridge.id,
          scentConfigId: cartridge.product.scentConfig.id,
          name: cartridge.product.scentConfig.code,
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
    commandType: CommandType,
    status: Status,
    scentId: string,
  ) {
    const device = await this.validateDeviceOwnership(deviceId, userId);

    const scent = await this.scentRepository.findOne({
      where: { id: scentId },
    });
    if (!scent) {
      throw new HttpException(MESSAGE.SCENT_MOBILE.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (commandType === CommandType.PLAY) {
      const scentConfigIds = JSON.parse(scent.cartridgeInfo).map((cartridge) => cartridge.id);

      const products = await this.productRepository.find({
        where: { scentConfig: { id: In(scentConfigIds) } },
      });

      const deviceCartridges = await this.deviceCartridgeRepository.find({
        where: {
          product: { id: In(products.map((product) => product.id)) },
          device: { id: device.id },
        },
      });

      const hasEmptyCartridge = deviceCartridges.some(
        (cartridge) => Number(cartridge.percentage) === 0,
      );

      if (hasEmptyCartridge) {
        throw new HttpException(
          'Some cartridges are empty, so the device will not play',
          HttpStatus.BAD_REQUEST,
        );
      }
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
      command.command.type = commandType;
      command.updatedAt = new Date();
      await this.deviceCommandRepository.save(command);
    } else {
      command = this.deviceCommandRepository.create({
        device: { id: device.id },
        command: { type: commandType },
        isExecuted: false,
      });
      await this.deviceCommandRepository.save(command);
    }

    const userSession = await this.userSessionRepository.findOne({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    if (userSession) {
      userSession.status = status;
      userSession.device = device;
      userSession.scent = scent;
      await this.userSessionRepository.update(userSession.id, userSession);
    } else {
      const userSession = this.userSessionRepository.create({
        device: { id: device.id },
        userId,
        scent: { id: scent.id },
        status,
      });

      await this.userSessionRepository.save(userSession);
    }

    return command;
  }
}
