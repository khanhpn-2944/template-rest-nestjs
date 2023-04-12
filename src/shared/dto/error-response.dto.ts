import { Expose } from 'class-transformer';

import { ErrorDto } from './error.dto';

export class ErrorResponseDto {
  @Expose()
  errors: ErrorDto[];

  @Expose()
  message?: string;
}
