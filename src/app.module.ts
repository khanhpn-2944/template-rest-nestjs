import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ScheduleModule } from '@nestjs/schedule';
import { MailerModule } from '@nestjs-modules/mailer';

import { AsyncRequestContextModule } from './async-request-context/async-request-context.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database.module';
import { LoggerModule } from './logger/logger.module';
import { RequestLoggerMiddleware } from './logger/request-logger.middleware';
import { mailerConfig } from './mailer/mailer.config';
import { PostModule } from './post/post.module';
import { AppConStant } from './shared/constants/app.constant';
import { TasksModule } from './tasks/tasks.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    DatabaseModule,
    BullModule.forRoot({
      redis: { ...AppConStant.redis },
    }),
    ScheduleModule.forRoot(),
    AsyncRequestContextModule.forRoot({ isGlobal: true }),
    MailerModule.forRootAsync({ useFactory: () => mailerConfig }),
    LoggerModule,
    UserModule,
    AuthModule,
    PostModule,
    TasksModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
