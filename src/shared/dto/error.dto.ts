import { Expose } from 'class-transformer';

import { Default } from '../decorators/default.decorator';

export class ErrorDto {
  @Expose()
  @Default(null)
  index?: number;

  @Expose()
  @Default(null)
  resource?: string;

  @Expose()
  message?: string;

  @Expose()
  @Default(null)
  property?: string;
}
