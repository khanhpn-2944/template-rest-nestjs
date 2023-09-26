import { Field, InputType } from '@nestjs/graphql';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

import { EntityConstant } from '../../shared/constants/entity.constant';
import { CreateTagDto } from '../../tag/dto';

@InputType()
export class CreatePostDto {
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(EntityConstant.shortLength)
  title: string;

  @Field()
  @IsString()
  @IsOptional()
  @MaxLength(EntityConstant.longLength)
  description: string;

  @Field(() => [CreateTagDto])
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  tags: CreateTagDto[];

  @Field()
  @IsString()
  @IsOptional()
  @MaxLength(EntityConstant.shortLength)
  fileName: string;
}
