import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import * as fs from 'fs';
import * as forge from 'node-forge';
import * as path from 'path';

@Injectable()
export class CertificateAuthGuard implements CanActivate {
  private caCertPath = process.env.CA_CERT_PATH || path.join(__dirname, '../../certs/ca.pem');
  private trustedCAs: forge.pki.Certificate[];

  constructor() {
    // Load trusted CA certificates
    this.loadTrustedCAs();
  }

  private loadTrustedCAs() {
    try {
      const caCertPem = fs.readFileSync(this.caCertPath, 'utf8');
      this.trustedCAs = [forge.pki.certificateFromPem(caCertPem)];
    } catch (error) {
      // console.error('Failed to load CA certificate:', error);
      throw new Error('Failed to load CA certificate');
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    // Extract client certificate from request
    // In Express.js, this typically comes from TLS termination
    const clientCertPem = request.socket['getPeerCertificate']?.();

    if (!clientCertPem) {
      throw new UnauthorizedException('No client certificate provided');
    }

    try {
      // Parse the client certificate
      const clientCert = forge.pki.certificateFromPem(clientCertPem);

      // Verify certificate against trusted CAs
      let verified = false;
      for (const ca of this.trustedCAs) {
        try {
          if (ca.verify(clientCert)) {
            verified = true;
            break;
          }
        } catch (e) {
          // Verification with this CA failed, try next
          continue;
        }
      }

      if (!verified) {
        throw new UnauthorizedException('Certificate not issued by a trusted CA');
      }

      // Verify the certificate is not expired
      const now = new Date();
      if (now < clientCert.validity.notBefore || now > clientCert.validity.notAfter) {
        throw new UnauthorizedException('Certificate is expired or not yet valid');
      }

      // Get the Common Name from the certificate
      const subject = clientCert.subject.getField('CN');
      const commonName = subject ? subject.value : null;

      // Check if this device ID exists in our database
      if (commonName) {
        // Store the device ID for use in the controller
        request['deviceId'] = commonName;

        // You would typically verify this against your database
        // const device = await this.deviceService.findByDeviceId(commonName);
        // if (!device) {
        //   throw new UnauthorizedException('Device not registered');
        // }
      } else {
        throw new UnauthorizedException('Certificate missing Common Name (CN)');
      }

      return true;
    } catch (error) {
      // console.error('Certificate verification failed:', error);
      throw new UnauthorizedException('Certificate verification failed');
    }
  }
}
