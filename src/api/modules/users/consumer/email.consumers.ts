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
  @Process('forgot-password')
  async sendMailResetPassword(job: Job<unknown>){

    console.log(job.data['mailURL']);
    
    await this.mailerService.sendMail({
      to: job.data['to'],
      subject: 'Engleet Reset Password Email',
      template: './forgot-password',
      context: {
        code: 'Reset your password',
        forgotToken: job.data['forgotToken'],
        mailURL: job.data['mailURL'],
      },
    });
  }
}
