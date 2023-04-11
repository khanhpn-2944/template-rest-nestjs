import { plainToInstance } from 'class-transformer';

import { ErrorDto } from '../dto/error.dto';
import { ErrorConstant } from '../../errors/error.constant';

export class ErrorUtil {
  static badRequest(
    errorType: string,
    property?: string,
    resource?: string,
    indexes?: number[],
    payload?: object,
  ): ErrorDto | ErrorDto[] {
    let codeAndMessage = ErrorConstant[errorType];

    if (codeAndMessage instanceof Function) {
      codeAndMessage = codeAndMessage(payload);
    }

    if (Array.isArray(indexes)) {
      return indexes.map((index) =>
        plainToInstance(ErrorDto, {
          resource,
          property,
          index,
          ...codeAndMessage,
        }),
      );
    }

    return plainToInstance(ErrorDto, {
      resource,
      property,
      index: indexes,
      ...codeAndMessage,
    });
  }
}
