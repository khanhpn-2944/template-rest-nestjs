import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { plainToClass } from 'class-transformer';

import { UserDto } from '../../user/dto/user.dto';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();

    return plainToClass(UserDto, req.user);
  },
);
