import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';

import { AppConStant } from '../constants/app.constant';

@Injectable()
export class FileSizeValidationPipe implements PipeTransform {
  async transform(value: any, { data }: ArgumentMetadata) {
    if (data === 'file' && value) {
      if (value.size > AppConStant.maxFileSize) {
        return false;
      }
    }

    return value;
  }
}
