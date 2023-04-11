import { Expose, Type } from 'class-transformer';

import { TagDto } from '../../tag/dto';

export class PostDto {
  @Expose()
  id: string;

  @Expose()
  title: string;

  @Expose()
  description: string;

  @Expose()
  @Type(() => TagDto)
  tags: TagDto[];
}
