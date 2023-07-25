import { Injectable } from '@nestjs/common';
import { PermissionRepository } from 'common/repositories/permissions/permissions.repository';
import { BaseService } from 'core/services/base.service';

@Injectable()
export class PermissionsService extends BaseService {
  constructor(private readonly repository: PermissionRepository) {
    super();
  }
}
