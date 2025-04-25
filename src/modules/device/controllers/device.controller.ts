import { Body, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { BaseController } from 'core/controllers/base.controller';
import { ApiController } from 'core/decorator/apiController.decorator';
import { AdminRoleGuard, MemberRoleGuard } from 'core/decorator/auth.decorator';
import { AuthUser } from 'core/decorator/auth-user.decorator';

import { Status } from '../../../common/entities/user-session.entity';
import { UserDto } from '../../user/dto/user.dto';
import { DevicePingDto, RegisterDeviceDto } from '../dto';
import { CommandDto } from '../dto/device/command.dto';
import {
  DeviceConnectSpaceDto,
  DeviceUpdateStatusDto,
} from '../dto/device/device-connect-space.dto';
import { DeviceSwitchSpaceDto } from '../dto/device/update-device.dto';
import { CommandType } from '../entities/device-command.entity';
import { DeviceService } from '../services/device.service';
import { DeviceCertificateService } from '../services/device-certificate.service';

@ApiController({
  name: 'devices',
})
export class DeviceController extends BaseController {
  constructor(
    private readonly deviceService: DeviceService,
    private readonly deviceCertificateService: DeviceCertificateService,
  ) {
    super();
  }

  @MemberRoleGuard()
  @Post('register')
  async registerDevice(@AuthUser() user: UserDto, @Body() dto: RegisterDeviceDto) {
    const result = await this.deviceService.registerDevice(dto, user.sub);

    return result;
  }

  @MemberRoleGuard()
  @Post('un-register')
  async unregisterDevice(@AuthUser() user: UserDto, @Body() dto: RegisterDeviceDto) {
    const result = await this.deviceService.unregisterDevice(dto, user.sub);

    return { success: true, data: result };
  }

  @MemberRoleGuard()
  @Get('/')
  async getUserRegisteredDevices(@AuthUser() user: UserDto) {
    const result = await this.deviceService.getUserRegisteredDevices(user.sub);

    return result;
  }

  @MemberRoleGuard()
  @Get(':deviceId')
  async getDeviceDetail(@Param('deviceId') deviceId: string) {
    const result = await this.deviceService.getDeviceDetail(deviceId);

    return result;
  }

  @AdminRoleGuard()
  @Post(':deviceId/provision')
  async provisionDevice(@Param('deviceId') deviceId: string) {
    const result = await this.deviceService.provisionDevice(deviceId);

    return { success: true, data: result };
  }

  @AdminRoleGuard()
  @Get(':deviceId/certificates')
  async getDeviceCertificates(@Param('deviceId') deviceId: string) {
    const certificates = await this.deviceCertificateService.findCertificateById(deviceId);

    return { success: true, data: certificates };
  }

  // @Post('register-device')
  // @ApiOperation({ summary: 'Register a new device and provision it in AWS IoT Core' })
  // @ApiResponse({
  //   status: 201,
  //   description: 'Device registered and provisioned successfully',
  //   type: DeviceProvisioningResponseDto,
  // })
  // async registerDevice(@Body() dto: RegisterDeviceDto) {
  //   // First create the device in our database
  //   const device = await this.deviceService.createDevice(dto);

  //   // Then provision it in AWS IoT Core
  //   const provisioningData = await this.deviceService.provisionDevice(dto.deviceId);

  //   return {
  //     success: true,
  //     data: { device, provisioningData },
  //     message: 'Device registered and provisioned successfully',
  //   };
  // }

  // @Post('device/:deviceId/confirm-certificate')
  // @ApiOperation({ summary: 'Confirm certificate delivery and clean up private key' })
  // async confirmCertificateDelivery(@Param('deviceId') deviceId: string) {
  //   const result = await this.deviceCertificateService.confirmCertificateDelivery(deviceId);

  //   return {
  //     success: true,
  //     data: result,
  //   };
  // }

  // @Get('device/:deviceId/certificate-status')
  // @ApiOperation({ summary: 'Get certificate status for a device' })
  // async getCertificateStatus(@Param('deviceId') deviceId: string) {
  //   const status = await this.deviceCertificateService.getDeviceCertificateStatus(deviceId);

  //   return {
  //     success: true,
  //     data: status,
  //   };
  // }

  // @Put('device/:deviceId/deactivate-certificate')
  // @ApiOperation({ summary: 'Deactivate a device certificate' })
  // async deactivateCertificate(@Param('deviceId') deviceId: string) {
  //   const result = await this.deviceCertificateService.deactivateDeviceCertificate(deviceId);

  //   return {
  //     success: true,
  //     data: result,
  //     message: 'Certificate deactivated successfully',
  //   };
  // }

  @MemberRoleGuard()
  @Patch(':deviceId/connect')
  @ApiOperation({ summary: 'Connect a device to a space' })
  async connectSpace(
    @AuthUser() user: UserDto,
    @Param('deviceId') deviceId: string,
    @Body() bodyRequest: DeviceConnectSpaceDto,
  ) {
    const result = await this.deviceService.connectSpace(user.sub, deviceId, bodyRequest.spaceId);

    return { success: true, data: result };
  }

  @MemberRoleGuard()
  @Patch(':deviceId/status')
  @ApiOperation({ summary: 'Update device status' })
  async updateDeviceStatus(
    @Param('deviceId') deviceId: string,
    @Body() bodyRequest: DeviceUpdateStatusDto,
  ) {
    const result = await this.deviceService.updateDeviceStatus(deviceId, bodyRequest.isConnected);

    return result;
  }

  @MemberRoleGuard()
  @Delete(':deviceId/space')
  @ApiOperation({ summary: 'Remove a device from a space' })
  async removeDeviceFromSpace(@AuthUser() user: UserDto, @Param('deviceId') deviceId: string) {
    const result = await this.deviceService.removeDeviceFromSpace(user.sub, deviceId);

    return result;
  }

  @MemberRoleGuard()
  @Delete(':deviceId')
  @ApiOperation({ summary: 'Remove a device' })
  async removeDevice(@AuthUser() user: UserDto, @Param('deviceId') deviceId: string) {
    const result = await this.deviceService.removeDevice(user.sub, deviceId);

    return result;
  }

  @MemberRoleGuard()
  @Patch(':deviceId/switch-space')
  @ApiOperation({ summary: 'Switch space of a device' })
  async switchSpace(
    @AuthUser() user: UserDto,
    @Param('deviceId') deviceId: string,
    @Body() bodyRequest: DeviceSwitchSpaceDto,
  ) {
    const result = await this.deviceService.switchSpace(user.sub, deviceId, bodyRequest.spaceId);

    return result;
  }

  @MemberRoleGuard()
  @Post(':deviceId/commands/play')
  @ApiOperation({ summary: 'Send play command to a device' })
  async sendPlayCommand(
    @Param('deviceId') deviceId: string,
    @Body() payload: CommandDto,
    @AuthUser() user: UserDto,
  ) {
    const command = await this.deviceService.queueCommand(
      deviceId,
      user.sub,
      CommandType.PLAY,
      Status.PLAYING,
      payload.scentId,
    );

    return command;
  }

  @MemberRoleGuard()
  @Post(':deviceId/commands/pause')
  @ApiOperation({ summary: 'Send pause command to a device' })
  async sendPauseCommand(
    @Param('deviceId') deviceId: string,
    @AuthUser() user: UserDto,
    @Body() payload: CommandDto,
  ) {
    const command = await this.deviceService.queueCommand(
      deviceId,
      user.sub,
      CommandType.PAUSE,
      Status.PAUSED,
      payload.scentId,
    );

    return command;
  }

  @MemberRoleGuard()
  @Post(':deviceId/ping')
  @ApiOperation({ summary: 'Ping status with device' })
  async pingStatus(
    @AuthUser() user: UserDto,
    @Param('deviceId') deviceId: string,
    @Body() bodyRequest: DevicePingDto,
  ) {
    return await this.deviceService.pingStatus(deviceId, user.sub, bodyRequest.scentId);
  }
}
