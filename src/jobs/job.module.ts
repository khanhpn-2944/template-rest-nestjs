import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';

import { jobConstant } from './job.constant';
import { JobProcessor } from './job.processor';
import { JobService } from './job.service';
import { AppConStant } from '../shared/constants/app.constant';

@Module({
  imports: [
    BullModule.registerQueue({
      name: jobConstant.name,
      redis: AppConStant.redis,
    }),
  ],
  providers: [JobService, JobProcessor],
  exports: [JobService],
})
export class JobModule {}
