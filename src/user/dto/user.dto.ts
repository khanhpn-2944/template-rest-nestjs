import { Exclude, Expose } from 'class-transformer';

export class UserDto {
  @Expose()
  username: string;

  @Expose()
  email: string;

  @Expose()
  code: string;

  @Exclude()
  password: string;
}
