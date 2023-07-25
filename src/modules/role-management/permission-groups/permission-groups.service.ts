import { Injectable } from '@nestjs/common';
import { PermissionGroupRepository } from 'common/repositories/permissions/permission-groups.repository';
import { BaseService } from 'core/services/base.service';

@Injectable()
export class PermissionGroupsService extends BaseService {
  constructor(private readonly repository: PermissionGroupRepository) {
    super();
  }
  updateOrCreate = async (name: string, parentName?: string) => {
    let parent = null;
    if (parentName) {
      parent = await this.repository.findOneBy({
        name: parentName,
      });
      if (!parent) {
        return;
      }
    }

    const old = await this.repository.findOneBy({ name });
    if (old) {
      old.parent = parent;

      return this.repository.save(old);
    }

    return this.repository.save({
      name,
      parent,
    });
  };
}
