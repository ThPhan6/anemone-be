import { Injectable } from '@nestjs/common';
import { SecurityGroupMemberRepository } from 'common/repositories/permissions/security-group-member.repository';
import { BaseService } from 'core/services/base.service';

@Injectable()
export class SecurityGroupMemberService extends BaseService {
  constructor(private readonly repository: SecurityGroupMemberRepository) {
    super();
  }
}
