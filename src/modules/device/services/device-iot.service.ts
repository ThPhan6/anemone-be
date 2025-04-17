import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Device } from 'modules/device/entities/device.entity';
import * as moment from 'moment';
import { IsNull, Repository } from 'typeorm';

import { UserSession } from '../../../common/entities/user-session.entity';
import { Command } from '../../../common/enum/command.enum';
import { DeviceCartridgesDto, DeviceHeartbeatDto } from '../dto';
import { DeviceCartridge } from '../entities/device-cartridge.entity';
import { DeviceCommand } from '../entities/device-command.entity';
import { Product, ProductType } from '../entities/product.entity';

@Injectable()
export class DeviceIotService {
  constructor(
    @InjectRepository(Device)
    private repository: Repository<Device>,
    @InjectRepository(DeviceCartridge)
    private cartridgeRepository: Repository<DeviceCartridge>,
    @InjectRepository(DeviceCommand)
    private commandRepository: Repository<DeviceCommand>,
    @InjectRepository(UserSession)
    private userSessionRepository: Repository<UserSession>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async findByDeviceId(deviceId: string): Promise<Device> {
    return this.repository.findOne({ where: { deviceId } });
  }

  async updateDeviceHeartbeat(deviceId: string, heartbeatDto: DeviceHeartbeatDto): Promise<void> {
    const device = await this.findByDeviceId(deviceId);
    if (!device) {
      throw new NotFoundException(`Device with ID ${deviceId} not found`);
    }

    // Update last ping time
    device.lastPingAt = new Date();

    await this.repository.save(device);

    // If cartridges info provided, update them
    if (heartbeatDto.cartridges?.length) {
      await this.syncDeviceCartridges(deviceId, { cartridges: heartbeatDto.cartridges });
    }
  }

  async getPendingCommands(deviceId: string): Promise<any[]> {
    const device = await this.findByDeviceId(deviceId);
    if (!device) {
      throw new NotFoundException(`Device with ID ${deviceId} not found`);
    }

    // Find and return pending commands
    const commands = await this.commandRepository.find({
      where: { device: { id: device.id } },
      order: { createdAt: 'ASC' },
    });

    // Optionally mark commands as processed/retrieved
    if (commands.length) {
      // You could mark them as retrieved or delete them based on your requirements
    }

    return commands;
  }

  async syncDeviceCartridges(
    deviceId: string,
    cartridgesDto: DeviceCartridgesDto,
    stopPlay = true,
  ): Promise<void> {
    const device = await this.findByDeviceId(deviceId);

    if (!device) {
      throw new HttpException(`Device with ID ${deviceId} not found`, HttpStatus.BAD_REQUEST);
    }

    // Validate positions: must be unique + valid range
    const seenPositions = new Set<number>();

    for (const cart of cartridgesDto.cartridges) {
      if (cart.position < 1 || cart.position > 6) {
        throw new HttpException(
          `Invalid cartridge position: ${cart.position}`,
          HttpStatus.BAD_REQUEST,
        );
      }

      if (seenPositions.has(cart.position)) {
        throw new HttpException(
          `Duplicate cartridge position: ${cart.position}`,
          HttpStatus.BAD_REQUEST,
        );
      }

      seenPositions.add(cart.position);
    }

    //check validate cartridges
    for (const cart of cartridgesDto.cartridges) {
      const product = await this.productRepository.findOne({
        where: {
          serialNumber: cart.serialNumber,
          type: ProductType.CARTRIDGE,
        },
      });

      if (!product) {
        throw new HttpException(
          `Cartridge with serial number ${cart.serialNumber} is not registered as a product`,
          HttpStatus.BAD_REQUEST,
        );
      }

      // attach product to cart info for later use (optional but useful)
      (cart as any).product = product;
    }

    if (stopPlay) {
      //send command pause
      await this.commandRepository.save({
        device,
        command: 'pause',
        isExecuted: false,
      });
    }

    // Get existing cartridges
    const existingCartridges = await this.cartridgeRepository.find({
      where: { device: { id: device.id } },
    });

    const cartridgeMapByPosition = new Map<number, DeviceCartridge>();

    for (const cart of existingCartridges) {
      cartridgeMapByPosition.set(Number(cart.position), cart);
    }

    for (const cartInfo of cartridgesDto.cartridges) {
      const existing = cartridgeMapByPosition.get(cartInfo.position);

      if (existing) {
        // If the cartridge is already in the map, update it
        if (existing.serialNumber === cartInfo.serialNumber) {
          // Same cartridge => update normally
          existing.eot = cartInfo.eot;
          existing.ert = cartInfo.ert;
          existing.percentage = cartInfo.percentage;
        } else {
          // New cartridge in same position => update metadata
          existing.serialNumber = cartInfo.serialNumber;
          existing.eot = cartInfo.eot;
          existing.ert = cartInfo.ert;
          existing.percentage = cartInfo.percentage;
        }

        await this.cartridgeRepository.save(existing);
      } else {
        // Completely new cartridge (new position)
        const newCartridge = this.cartridgeRepository.create({
          ...cartInfo,
          device,
          product: (cartInfo as any).product,
        });

        await this.cartridgeRepository.save(newCartridge);
      }
    }
  }

  /**
   * Update device last ping timestamp
   */
  async updateLastPing(deviceId: string) {
    const device = await this.repository.findOne({
      where: { deviceId },
    });

    if (!device) {
      throw new NotFoundException(`Device ${deviceId} not found`);
    }

    device.lastPingAt = new Date();
    device.isConnected = true;
    await this.repository.save(device);
  }

  /**
   * Update device status
   */
  async updateDeviceStatus(deviceId: string, statusData: any): Promise<void> {
    const device = await this.repository.findOne({
      where: { id: deviceId },
    });

    if (!device) {
      throw new NotFoundException(`Device with ID ${deviceId} not found`);
    }

    // Update device with status data
    // You can expand this to update specific fields based on the statusData
    if (statusData.isConnected !== undefined) {
      device.isConnected = statusData.isConnected;
    }

    await this.repository.save(device);
  }

  async syncCartridges(deviceId: string, cartridges: any[]) {
    const device = await this.findByDeviceId(deviceId);

    if (!device) {
      throw new NotFoundException(`Device with ID ${deviceId} not found`);
    }

    // Remove old cartridges
    await this.cartridgeRepository.delete({ device: { id: deviceId } });

    // Create new cartridges
    const newCartridges = this.cartridgeRepository.create(
      cartridges.map((cartridge) => ({
        ...cartridge,
        deviceId,
      })),
    );

    await this.cartridgeRepository.save(newCartridges);

    return newCartridges;
  }

  async addCommand(deviceId: string, command: string) {
    const device = await this.findByDeviceId(deviceId);

    const deviceCommand = this.commandRepository.create({
      device,
      command,
    });

    return this.commandRepository.save(deviceCommand);
  }

  async markCommandExecuted(commandId: string) {
    const command = await this.commandRepository.findOne({
      where: { id: commandId },
    });

    if (!command) {
      throw new NotFoundException('Command not found');
    }

    // command.executed = true;
    // command.executedAt = new Date();

    return this.commandRepository.save(command);
  }

  async handleHeartbeat(deviceId: string, dto: DeviceHeartbeatDto) {
    const device = await this.findByDeviceId(deviceId);

    if (!device) {
      throw new NotFoundException('Device not found');
    }

    // Update last ping
    await this.updateLastPing(deviceId);

    //  Update device status
    if (dto.deviceStatus) {
      //check user session
      const userSession = await this.userSessionRepository.findOne({
        where: { device: { id: deviceId } },
      });

      if (userSession) {
        userSession.status = dto.deviceStatus;
        await this.userSessionRepository.update(userSession.id, userSession);
      }
    }

    if (dto.cartridges) {
      // Sync cartridges
      await this.syncDeviceCartridges(deviceId, { cartridges: dto.cartridges }, false);
    }

    // Check if there is any pending command for the device
    const pendingCommand = await this.commandRepository.findOne({
      where: { device: { id: deviceId }, deletedAt: IsNull() },
      order: { createdAt: 'DESC' }, // if you want to get the latest command
    });

    // Check lastPingAt — if > 15s ago, return command: "request auth"
    if (device.lastPingAt) {
      const secondsSinceLastPing = moment().diff(moment(device.lastPingAt), 'seconds');

      if (secondsSinceLastPing > 15) {
        return {
          command: Command['Request auth'],
        };
      }
    }

    return {
      command: pendingCommand ? Command['Pending command'] : Command.None,
    };
  }
}
