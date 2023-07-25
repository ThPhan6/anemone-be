import { Injectable } from '@nestjs/common';
import { PermissionSecurityGroupRepository } from 'common/repositories/permissions/permission-security-group.repository';
import { BaseService } from 'core/services/base.service';
import { DeleteResult } from 'typeorm';

@Injectable()
export class PermissionSecurityGroupsService extends BaseService {
  constructor(private readonly repository: PermissionSecurityGroupRepository) {
    super();
  }

  delete(id: number): Promise<DeleteResult> {
    return this.repository.delete(id);
  }
}
