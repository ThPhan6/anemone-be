import { Injectable } from '@nestjs/common';
import { SecurityGroupRepository } from 'common/repositories/permissions/security-groups.repository';
import { BaseService } from 'core/services/base.service';

@Injectable()
export class SecurityGroupsService extends BaseService {
  constructor(private readonly repository: SecurityGroupRepository) {
    super();
  }
}
