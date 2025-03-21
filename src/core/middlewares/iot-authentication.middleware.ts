import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NextFunction, Request, Response } from 'express';
import { Repository } from 'typeorm';

import { Device } from '../../modules/device/entities/device.entity';
import { DeviceCertificateService } from '../../modules/device/services/device-certificate.service';

@Injectable()
export class IoTAuthenticationMiddleware implements NestMiddleware {
  constructor(
    @InjectRepository(Device)
    private deviceRepository: Repository<Device>,
    private deviceCertificateService: DeviceCertificateService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Extract client ID from headers
    const clientId = req.headers['x-device-id'] as string;
    const certId = req.headers['x-certificate-id'] as string;

    if (!clientId || !certId) {
      throw new UnauthorizedException('Device authentication required');
    }

    // Find device by deviceId
    const device = await this.deviceRepository.findOne({
      where: { deviceId: clientId },
      relations: ['product'],
    });

    if (!device) {
      throw new UnauthorizedException('Device not registered');
    }

    // Verify certificate belongs to this device
    // In a real implementation, you would validate against AWS IoT
    // For simplicity, we're just checking if there's a certificate record
    const hasCertificate = await this.deviceCertificateService.findCertificateById(certId);

    if (!hasCertificate) {
      throw new UnauthorizedException('Invalid device certificate');
    }

    // Attach device to request for controllers to use
    req['device'] = device;

    next();
  }
}
