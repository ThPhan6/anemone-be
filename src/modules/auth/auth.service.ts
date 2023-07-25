import { Injectable } from '@nestjs/common';
import { Message } from 'common/constants/app.constants';
import { MessageCode } from 'common/constants/messageCode';
import { ForgotPasswordEntity } from 'common/entities/forgotPassword.entity';
import { UserEntity } from 'common/entities/user.entity';
import { ForgotPasswordRepository } from 'common/repositories/forgotPassword.repository';
import { UserRepository } from 'common/repositories/user.repository';
import { ApiForbiddenException, ApiInternalErrorException, ApiNotFoundException } from 'common/types/apiException.type';
import { signData } from 'common/utils/jwt';
import { decryptForPassword, encryptedPassword } from 'common/utils/password';
import { logger } from 'core/logger/index.logger';
import { BaseService } from 'core/services/base.service';
import { MailService } from 'modules/mail/mail.service';

import { LoginResDto } from './dto/auth.response';

@Injectable()
export class AuthService extends BaseService {
  constructor(
    private userRepository: UserRepository,
    private forgotPasswordRepository: ForgotPasswordRepository,
    private mailService: MailService,
  ) {
    super();
  }

  async login(mailAddress: string, password: string): Promise<LoginResDto> {
    const user = await this.userRepository.findOneBy({ mailAddress });
    if (!user) {
      throw new ApiNotFoundException(MessageCode.wrongMailOrPassword, Message.wrongMailOrPassword);
    }

    if (user.invalidFlg) {
      throw new ApiNotFoundException(MessageCode.userIsDisabled, Message.userIsDisabled);
    }

    const isMatched = password === decryptForPassword(user.password);
    if (!isMatched) {
      throw new ApiNotFoundException(MessageCode.wrongMailOrPassword, Message.wrongMailOrPassword);
    }

    try {
      const accessToken = signData({
        userId: user.id,
      });
      logger.info('login - 10');

      return {
        userId: user.id,
        accessToken,
        refreshToken: accessToken,
      };
    } catch (e) {
      logger.error('login', e);
      throw e;
    }
  }

  async forgotPassword(mailAddress: string): Promise<void> {
    const user = await this.userRepository.findOneBy({ mailAddress });
    if (!user) {
      throw new ApiNotFoundException();
    }

    const runner = this.userRepository.createQueryRunner('master');
    try {
      await runner.connect();
      await runner.startTransaction();
      const manager = runner.manager;
      await manager.delete(ForgotPasswordEntity, { userId: user.id });
      const result = await manager
        .createQueryBuilder()
        .insert()
        .into(ForgotPasswordEntity)
        .values({ userId: user.id, expiredAt: () => `NOW() + INTERVAL '${process.env.FORGOT_PASSWORD_CODE_DURATION}'` })
        .execute();
      await runner.commitTransaction();
      if (result.generatedMaps.length === 0) {
        throw new ApiInternalErrorException();
      }

      this.mailService.sendForgotPasswordMail(mailAddress, result.generatedMaps[0]['code']);
    } catch (err) {
      await runner.rollbackTransaction();
      throw err;
    } finally {
      await runner.release();
    }
  }

  async resetPassword(code: string, password: string): Promise<void> {
    const forgotToken = await this.forgotPasswordRepository
      .createQueryBuilder()
      .where({ code })
      .andWhere('expired_at > NOW()')
      .getOne();
    if (!forgotToken) {
      throw new ApiNotFoundException(MessageCode.invalidResetPasswordCode, Message.invalidResetPasswordCode);
    }

    const runner = this.userRepository.createQueryRunner('master');
    await runner.connect();
    await runner.startTransaction();
    try {
      await runner.manager
        .createQueryBuilder()
        .update(UserEntity)
        .set({ password: encryptedPassword(password), passwordUpdateTime: () => 'NOW()' })
        .where({ id: forgotToken.userId })
        .execute();
      await runner.manager.delete(ForgotPasswordEntity, forgotToken.id);
      await runner.commitTransaction();
    } catch (err) {
      await runner.rollbackTransaction();
      throw err;
    } finally {
      await runner.release();
    }
  }

  async changePassword(id: string, password: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new ApiInternalErrorException();
    }

    const isMatched = password === decryptForPassword(user.password);
    if (!isMatched) {
      throw new ApiForbiddenException(MessageCode.wrongPassword, Message.wrongPassword);
    }

    await this.userRepository
      .createQueryBuilder()
      .update()
      .set({ password: encryptedPassword(newPassword), passwordUpdateTime: () => 'NOW()' })
      .where({ id })
      .execute();
  }

  async logout(): Promise<any> {
    return true;
  }
}
