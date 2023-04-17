import { OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { Inject, Logger } from '@nestjs/common';
import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';
import { DoneCallback, Job } from 'bull';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

import { jobConstant } from './job.constant';
import { LoggerConstant } from '../shared/constants/logger.constant';

@Processor(jobConstant.name)
export class JobProcessor {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
    private readonly mailerService: MailerService,
  ) {}

  @Process(jobConstant.sendMailProcess)
  async sendMail(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { data }: { data: ISendMailOptions } = job;
      console.log('Job run with data: ' + JSON.stringify(data));

      await this.mailerService.sendMail({
        to: data.to,
        subject: data.subject,
        text: data.text,
        template: data.template,
        context: data.context,
      });
    } catch (error) {
      this.logging(error);
    }
    done();
  }

  @OnQueueFailed()
  async failed(error): Promise<void> {
    this.logging(error);
  }

  private logging(error): void {
    if (error.query) {
      const { query, parameters } = error;
      const stringifyParams =
        parameters && parameters.length
          ? LoggerConstant.parameterPrefix + JSON.stringify(parameters)
          : '';
      const sql = LoggerConstant.queryPrefix + query + stringifyParams;

      this.logger.log(sql, LoggerConstant.backgroundJobContext);
    }

    this.logger.error(
      error.stack || error,
      null,
      LoggerConstant.backgroundJobContext,
    );
  }
}
