import { Body, Get, Post, UseGuards } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { ApiDeviceHeaders, IoTDevice } from 'core/decorator/iot-device.decorator';
import { IoTAuthGuard } from 'core/guards/iot-auth.guard';

import { BaseController } from '../../../core/controllers/base.controller';
import { ApiController } from '../../../core/decorator/apiController.decorator';
import { DeviceCartridgesDto, DeviceHeartbeatDto } from '../dto';
import { Device } from '../entities/device.entity';
import { DeviceIotService } from '../services/device-iot.service';

@ApiController({
  name: 'iot-devices',
  tags: 'IoT Devices',
})
@UseGuards(IoTAuthGuard)
export class DeviceIotController extends BaseController {
  constructor(private service: DeviceIotService) {
    super();
  }

  @Post('auth')
  @ApiOperation({ summary: 'Device auth endpoint' })
  @ApiDeviceHeaders()
  async auth(@IoTDevice() device: Device) {
    if (device.isConnected) {
      // Update last ping time
      await this.service.updateLastPing(device.product.serialNumber);
    }

    return {
      success: device.isConnected ? true : false,
      timestamp: new Date().toISOString(),
      deviceId: device.product.serialNumber,
    };
  }

  @Get('ping')
  @ApiOperation({ summary: 'Device ping endpoint' })
  @ApiDeviceHeaders()
  async ping(@IoTDevice() device: Device) {
    // Update last ping time
    await this.service.updateLastPing(device.product.serialNumber);

    return {
      success: true,
      timestamp: new Date().toISOString(),
      deviceId: device.product.serialNumber,
    };
  }

  @Post('status')
  @ApiDeviceHeaders()
  async updateStatus(
    @IoTDevice() device: Device,
    @Body() data: { status: string; playlistId?: string; scentId?: string },
  ) {
    await this.service.updateDeviceStatus(device.product.serialNumber, data);

    return { status: 'success' };
  }

  @Get('commands')
  @ApiDeviceHeaders()
  async getCommands(@IoTDevice() device: Device) {
    const command = await this.service.getPendingCommand(device.product.serialNumber);

    return command;
  }

  @Post('cartridges')
  @ApiOperation({ summary: 'Sync cartridges' })
  @ApiDeviceHeaders()
  async syncCartridges(@IoTDevice() device: Device, @Body() data: DeviceCartridgesDto) {
    await this.service.syncDeviceCartridges(device.product.serialNumber, data);

    return this.ok(true, {
      message: 'Cartridge data synced successfully',
    });
  }

  @Post('heartbeat')
  @ApiDeviceHeaders()
  async heartbeat(@IoTDevice() device: Device, @Body() data: DeviceHeartbeatDto) {
    return await this.service.handleHeartbeat(device.product.serialNumber, data);
  }
}
