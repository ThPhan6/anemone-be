import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Device } from 'modules/device/entities/device.entity';
import * as moment from 'moment';
import { IsNull, Repository } from 'typeorm';

import { Scent } from '../../../common/entities/scent.entity';
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

  async getPendingCommand(deviceId: string) {
    const device = await this.findByDeviceId(deviceId);
    if (!device) {
      throw new NotFoundException(`Device with ID ${deviceId} not found`);
    }

    // Find and return pending commands
    const command = await this.commandRepository.findOne({
      where: { device: { id: device.id }, deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });

    if (!command) {
      return null;
    }

    // Continue if command is 'play'
    //get cartridges of device
    const cartridges = await this.cartridgeRepository.find({
      where: { device: { id: device.id } },
    });

    //Get user session newest with device, include scent info
    const userSession = await this.userSessionRepository.findOne({
      where: { device: { id: device.id } },
      order: { createdAt: 'DESC' },
      relations: ['scent'],
    });

    // Pause command or no user session => return all uptime = 0
    if (command.command === 'pause' || !userSession) {
      return {
        interval: parseInt(process.env.REPEAT_INTERVAL),
        cycle: -1,
        cartridges: Array.from({ length: 6 }, (_, i) => ({
          position: i + 1,
          uptime: 0,
        })),
      };
    }

    const cartridgeUptimes = this.calculateCartridgeUptimes(userSession.scent, cartridges);

    //mark command as executed
    await this.commandRepository.update(command.id, { isExecuted: true, deletedAt: new Date() });

    return {
      interval: parseInt(process.env.REPEAT_INTERVAL),
      cycle: -1,
      cartridges: cartridgeUptimes,
    };
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

    // Filter out invalid cartridges (serialNumber = '0')
    const validCartridges = cartridgesDto.cartridges.filter((cart) => cart.serialNumber !== '0');

    // Validate positions: must be unique + valid range
    const seenPositions = new Set<number>();

    for (const cart of validCartridges) {
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
    for (const cart of validCartridges) {
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
        where: { device: { id: device.id } },
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
      where: { device: { id: device.id }, deletedAt: IsNull() },
      order: { createdAt: 'DESC' }, // if you want to get the latest command
    });

    // Check lastPingAt — if > 15s ago, return command: "request auth"
    if (device.lastPingAt) {
      const secondsSinceLastPing = moment().diff(moment(device.lastPingAt), 'seconds');

      if (secondsSinceLastPing > parseInt(process.env.HEARTBEAT_EXPIRE_SECONDS)) {
        return {
          command: Command.REQUEST_AUTH,
        };
      }
    }

    return {
      command: pendingCommand ? Command.PENDING_COMMAND : Command.NONE,
    };
  }

  private calculateCartridgeUptimes(
    scent: Scent,
    cartridges: DeviceCartridge[],
  ): { position: number; uptime: number }[] {
    // Create map to quickly lookup: serialNumber -> intensity
    const scentMap = new Map<string, number>();

    for (const info of scent.cartridgeInfo || []) {
      const intensity = Number(info.intensity);
      //check intensity valid range
      if (intensity >= 1 && intensity <= 5) {
        scentMap.set(info.serialNumber, intensity);
      }
    }
    // intensity in each position from 1 to 6, if not, intensity = 0
    const cartridgeIntensities: { position: number; intensity: number }[] = [];

    for (let pos = 1; pos <= 6; pos++) {
      //find cartridge corresponding to current position
      const deviceCart = cartridges.find((c) => Number(c.position) === pos);
      // If cartridge exists, get intensity from scentMap (if not, = 0)
      const intensity = deviceCart ? (scentMap.get(deviceCart.serialNumber) ?? 0) : 0;

      cartridgeIntensities.push({ position: pos, intensity });
    }
    //  Calculate total uptime = intensity sum of scent * 200ms (1 unit = 200ms)
    const totalIntensity = cartridgeIntensities.reduce((sum, c) => sum + c.intensity, 0);

    const totalUptime = Number(scent.intensity) * 200;

    //Calculate uptime of each position based on the intensity of each position
    return cartridgeIntensities.map((c) => ({
      position: c.position,
      uptime: totalIntensity > 0 ? Math.round((c.intensity / totalIntensity) * totalUptime) : 0,
    }));
  }
}
