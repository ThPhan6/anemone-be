import { Injectable } from '@nestjs/common';
import { PolicyPermissionRepository } from 'common/repositories/permissions/policy-permission.repository';
import { BaseService } from 'core/services/base.service';

@Injectable()
export class PolicyPermissionsService extends BaseService {
  constructor(private readonly repository: PolicyPermissionRepository) {
    super();
  }
}
