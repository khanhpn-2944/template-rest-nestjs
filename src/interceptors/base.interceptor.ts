import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

interface Response<T> {
  status: number;
  data: T;
  meta: object;
}

@Injectable()
export class BaseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<any> {
    return next.handle().pipe(
      map((data: T) => ({
        status: context.switchToHttp().getResponse().statusCode,
        data: data,
        meta: {},
      })),
    );
  }
}
