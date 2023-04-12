import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

import { Post } from '../../entities/post.entity';
import { EntityConstant } from '../../shared/constants/entity.constant';
import { CreateTagDto } from '../../tag/dto';

export class CreatePostDto {
  static resource = Post.name;

  @IsString()
  @IsNotEmpty()
  @MaxLength(EntityConstant.shortLength)
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(EntityConstant.longLength)
  description: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateTagDto)
  tags: CreateTagDto[];
}
