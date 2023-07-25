import { Injectable } from '@nestjs/common';
import { SecurityGroupPolicyRepository } from 'common/repositories/permissions/security-group-policy.repository';
import { BaseService } from 'core/services/base.service';

@Injectable()
export class SecurityGroupPolicyService extends BaseService {
  constructor(private readonly repository: SecurityGroupPolicyRepository) {
    super();
  }
}
