import { MailerOptions } from '@nestjs-modules/mailer';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';

export const mailerConfig: MailerOptions = {
  transport: {
    host: process.env.MAIL_HOST,
    port: +process.env.MAIL_PORT,
  },
  defaults: {
    from: process.env.MAIL_FROM,
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD,
    },
  },
  template: {
    dir: __dirname + '/templates',
    adapter: new PugAdapter(),
    options: {
      strict: true,
    },
  },
};
