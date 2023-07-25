import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as SendGrid from '@sendgrid/mail';
import { SendgridEntity } from 'common/entities/sendgrid.entity';
import { SendgridRepository } from 'common/repositories/sendgrid.repository';
import { logger } from 'core/logger/index.logger';
import { isEmpty } from 'lodash';
import { DeepPartial } from 'typeorm';

import { Mail } from './mail.type';

@Injectable()
export class MailService {
  constructor(
    private readonly configService: ConfigService,
    private readonly sendgridRepository: SendgridRepository,
  ) {
    SendGrid.setApiKey(this.configService.get<string>('SENDGRID_API_KEY'));
  }

  async send(data: { mail: Mail; userId?: string }): Promise<void> {
    try {
      const res = await this.sendMail(data.mail);
      this.insertSendResult(res, data.mail, data.userId);
    } catch (e) {
      logger.error(`MailService::send - from: ${data.mail.from}, subject: ${data.mail.subject}, error: ${e}`);
      throw e;
    }
  }

  private async sendMail(mail: Mail): Promise<SendGrid.ClientResponse> {
    const res = await SendGrid.send({
      from: mail.from,
      to: mail.toList,
      cc: mail.ccList,
      bcc: mail.bccList,
      subject: mail.subject,
      text: mail.body,
      html: mail.html,
      attachments: mail.attachments,
      customArgs: mail.customArgs,
    });

    return res[0];
  }

  async sendForgotPasswordMail(mailAddress: string, code: string): Promise<void> {
    try {
      const url = this.webUrl(`reset-password?code=${code}`);
      const mail = new Mail();
      mail.from = 'ENV_FROM';
      mail.subject = 'Reset your password!';
      mail.body = `This is your reset password link: ${url}\n\n`;
      mail.toList = [mailAddress];
      await this.send({ mail });
    } catch (e) {
      logger.error(`sendForgotPasswordMail - Message : ${e.message}`);
    }
  }

  private async insertSendResult(res: SendGrid.ClientResponse, mail: Mail, userId?: string): Promise<boolean> {
    const sendgridId: string = res.headers['x-message-id'];
    if (isEmpty(sendgridId)) {
      return false;
    }

    const mails: string[] = [];
    mails.push(...mail.toList.map(v => v.email ?? v));
    if (mail.ccList && mail.ccList.length > 0) {
      mails.push(...mail.ccList.map(v => v.email ?? v));
    }

    if (mail.bccList && mail.bccList.length > 0) {
      mails.push(...mail.bccList.map(v => v.email ?? v));
    }

    const entities: DeepPartial<SendgridEntity>[] = mails.map(mailAddress => {
      return {
        sendgridId,
        mailAddress,
        status: 0,
        mailType: mail.type?.toString(),
        modifiedInfo: {
          createdBy: userId,
        },
      };
    });
    await this.sendgridRepository.bulkSave(entities);
  }

  private webUrl(path = ''): string {
    return this.configService.get<string>('WEB_URL') + `/${path}`;
  }
}
