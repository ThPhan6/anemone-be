import { Injectable } from '@nestjs/common';
import { PolicyRepository } from 'common/repositories/permissions/policy.repository';
import { BaseService } from 'core/services/base.service';

@Injectable()
export class PolicyService extends BaseService {
  constructor(private readonly repository: PolicyRepository) {
    super();
  }
}
