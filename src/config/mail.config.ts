import { MailerOptions } from '@nestjs-modules/mailer';
import { config } from 'dotenv';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

config({ path: '.env' });
export const MailConfig = (): MailerOptions => ({
  transport: {
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT),
    secure: false,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD,
    },
  },
  defaults: {
    from: process.env.MAIL_SENDER,
  },
  template: {
    dir: join(__dirname, '../../dist/templates/email' ),
    adapter: new HandlebarsAdapter(),
    options: {
      strict: true,
    },
  },
});
