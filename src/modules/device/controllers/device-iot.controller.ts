import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { IoTDevice } from 'core/decorator/iot-device.decorator';
import { ApiDeviceHeaders } from 'core/decorator/iot-device-headers.decorator';
import { IoTAuthGuard } from 'core/guards/iot-auth.guard';

import { DeviceCartridgesDto } from '../dto';
import { Device } from '../entities/device.entity';
import { DeviceIotService } from '../services/device-iot.service';

@Controller('iot-devices')
@ApiTags('IoT Device')
@UseGuards(IoTAuthGuard)
export class DeviceIotController {
  constructor(private service: DeviceIotService) {}

  @Post('auth')
  @ApiOperation({ summary: 'Device auth endpoint' })
  @ApiDeviceHeaders()
  async auth(@IoTDevice() device: Device) {
    // Update last ping time
    await this.service.updateLastPing(device.deviceId);

    return {
      success: true,
      timestamp: new Date().toISOString(),
      deviceId: device.deviceId,
    };
  }

  @Get('ping')
  @ApiOperation({ summary: 'Device ping endpoint' })
  @ApiDeviceHeaders()
  async ping(@IoTDevice() device: Device) {
    // Update last ping time
    await this.service.updateLastPing(device.deviceId);

    return {
      success: true,
      timestamp: new Date().toISOString(),
      deviceId: device.deviceId,
    };
  }

  @Post('status')
  @ApiDeviceHeaders()
  async updateStatus(
    @IoTDevice() device: Device,
    @Body() data: { status: string; playlistId?: string; scentId?: string },
  ) {
    await this.service.updateDeviceStatus(device.deviceId, data);

    return { status: 'success' };
  }

  @Get('commands')
  @ApiDeviceHeaders()
  async getCommands(@IoTDevice() device: Device) {
    const commands = await this.service.getPendingCommands(device.deviceId);

    return {
      status: 'success',
      data: { commands },
    };
  }

  @Post('cartridges')
  @ApiDeviceHeaders()
  async syncCartridges(
    @IoTDevice() device: Device,
    @Body() data: { cartridges: DeviceCartridgesDto },
  ) {
    await this.service.syncDeviceCartridges(device.deviceId, data.cartridges);

    return { status: 'success' };
  }
}
