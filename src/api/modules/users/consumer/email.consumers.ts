import { MailerService } from '@nestjs-modules/mailer';
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

@Processor('send-mail')
export class EmailConsumers {
  constructor(private mailerService: MailerService) {}
  @Process('register')
  async sendMailRegister(job: Job<unknown>) {
    await this.mailerService.sendMail({
      to: job.data['to'],
      subject: 'Please verify your email',
      template: './verification',
      context: {
        name: job.data['name'],
        code: 'Account verification - EngLeet',
        verifyToken: job.data['verifyToken'],
        mailURL: job.data['mailURL'],
      },
    });
  }
}
