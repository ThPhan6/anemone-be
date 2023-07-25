import { Injectable } from '@nestjs/common';
import { UserRepository } from 'common/repositories/user.repository';
import { BaseService } from 'core/services/base.service';
import { StorageService } from 'modules/storage/storage.service';

import { GetMeResDto } from './dto/getMe.response';

@Injectable()
export class CommonService extends BaseService {
  constructor(
    private userRepository: UserRepository,
    private storageService: StorageService,
  ) {
    super();
  }

  async getMe(userId: string): Promise<GetMeResDto> {
    const u = await this.userRepository.findOneBy({ id: userId });
    const user: any = u;
    const permissions: any = {};
    // items.forEach((i) => {
    //   permissions[i.menuCode] = {
    //     refer: i.authReferFlg,
    //     insert: i.authUpdateFlg,
    //     update: i.authUpdateFlg,
    //     delete: i.authUpdateFlg,
    //     print: i.authPrintFlg,
    //     exec: i.authReferFlg,
    //   };
    // });
    const logo = await this.getLogo();

    return { user, logo, permissions };
  }

  private async getLogo(): Promise<string> {
    let logo: string;

    if (logo && logo !== '') {
      return this.storageService.getSignedUrl(logo);
    }
  }
}
