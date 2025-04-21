import { Body, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { BaseController } from 'core/controllers/base.controller';
import { ApiController } from 'core/decorator/apiController.decorator';
import { AdminRoleGuard, MemberRoleGuard } from 'core/decorator/auth.decorator';
import { AuthUser } from 'core/decorator/auth-user.decorator';

import { UserDto } from '../../user/dto/user.dto';
import { RegisterDeviceDto } from '../dto';
import {
  DeviceConnectSpaceDto,
  DeviceUpdateStatusDto,
} from '../dto/device/device-connect-space.dto';
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

    return { success: true, data: result };
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

    return { success: true, data: result };
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
  async removeSpace(@Param('deviceId') deviceId: string) {
    const result = await this.deviceService.removeSpace(deviceId);

    return result;
  }
}
