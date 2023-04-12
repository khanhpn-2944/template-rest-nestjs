import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

import { EntityConstant } from '../../shared/constants/entity.constant';
import { Tag } from '../../entities/tag.entity';

export class CreateTagDto {
  static resource = Tag.name;

  @IsString()
  @IsNotEmpty()
  @MaxLength(EntityConstant.shortLength)
  name: string;
}
