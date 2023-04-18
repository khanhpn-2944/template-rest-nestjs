import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { ISendMailOptions } from '@nestjs-modules/mailer';
import { Queue } from 'bull';

import { jobConstant } from './job.constant';

@Injectable()
export class JobService {
  constructor(@InjectQueue(jobConstant.name) private readonly queue: Queue) {}

  async sendMailJob(data: ISendMailOptions): Promise<void> {
    await this.queue.add(jobConstant.sendMailProcess, data, {
      attempts: jobConstant.maxAttempts,
      removeOnComplete: true,
    });
  }
}
