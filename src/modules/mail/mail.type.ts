import { templateFilePath } from 'common/utils/template';
import * as fs from 'fs';

export class MailAddressInfo {
  constructor(
    public email: string,
    public name?: string,
  ) {}
}

export enum MailType {
  procedure = 1000,
}

export interface MailAttachment {
  content: string;
  filename: string;
}

export class Mail {
  from: string;
  toList: MailAddressInfo[] | string[];
  ccList: MailAddressInfo[] | string[];
  bccList: MailAddressInfo[] | string[];
  type: MailType;
  subject: string;
  body: string;
  attachments: MailAttachment[];
  html: string;
  customArgs?: { [key: string]: any };

  constructor() {
    this.customArgs = { sysid: 'company' };
  }

  setCustomArg(key: string, value: any) {
    this.customArgs[key] = value;
  }

  async loadTitle(filename: string) {
    const path = templateFilePath(`mail/${filename}`);
    this.subject = fs.readFileSync(path).toString();
  }

  async loadBody(filename: string) {
    const path = templateFilePath(`mail/${filename}`);
    this.body = fs.readFileSync(path).toString();
  }
}
