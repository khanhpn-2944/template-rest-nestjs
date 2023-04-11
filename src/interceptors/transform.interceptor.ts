import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { map, Observable } from 'rxjs';

interface Response<T> {
  data: T;
}

interface ClassConstructor {
  new (...args: any[]): unknown;
}

export const Serialize = (dto: ClassConstructor) =>
  UseInterceptors(new TransformInterceptor(dto));

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  constructor(private dto: ClassConstructor) {}

  intercept(_context: ExecutionContext, next: CallHandler<T>): Observable<any> {
    return next
      .handle()
      .pipe(
        map((data: T) =>
          plainToInstance(this.dto, data, { excludeExtraneousValues: true }),
        ),
      );
  }
}
