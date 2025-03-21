import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Device } from 'modules/device/entities/device.entity';
import { Repository } from 'typeorm';

import { DeviceCartridgesDto, DeviceHeartbeatDto } from '../dto';
import { DeviceCartridge } from '../entities/device-cartridge.entity';
import { DeviceCommand } from '../entities/device-command.entity';

@Injectable()
export class DeviceIotService {
  constructor(
    @InjectRepository(Device)
    private repository: Repository<Device>,
    @InjectRepository(DeviceCartridge)
    private cartridgeRepository: Repository<DeviceCartridge>,
    @InjectRepository(DeviceCommand)
    private commandRepository: Repository<DeviceCommand>,
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

  async syncDeviceCartridges(deviceId: string, cartridgesDto: DeviceCartridgesDto): Promise<void> {
    const device = await this.findByDeviceId(deviceId);
    if (!device) {
      throw new NotFoundException(`Device with ID ${deviceId} not found`);
    }

    // Get existing cartridges
    const existingCartridges = await this.cartridgeRepository.find({
      where: { device: { id: device.id } },
    });

    // Map by serial number for easier lookup
    const existingBySerial = new Map(existingCartridges.map((c) => [c.serialNumber, c]));

    // Process each cartridge from the request
    for (const cartInfo of cartridgesDto.cartridges) {
      if (existingBySerial.has(cartInfo.serialNumber)) {
        // Update existing cartridge
        const cartridge = existingBySerial.get(cartInfo.serialNumber);
        cartridge.eot = cartInfo.eot;
        cartridge.ert = cartInfo.ert;
        cartridge.percentage = cartInfo.percentage;
        cartridge.position = cartInfo.position;
        await this.cartridgeRepository.save(cartridge);
      } else {
        // Create new cartridge
        const cartridge = new DeviceCartridge();
        cartridge.serialNumber = cartInfo.serialNumber;
        cartridge.eot = cartInfo.eot;
        cartridge.ert = cartInfo.ert;
        cartridge.percentage = cartInfo.percentage;
        cartridge.position = cartInfo.position;
        cartridge.device = device;
        await this.cartridgeRepository.save(cartridge);
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
}
