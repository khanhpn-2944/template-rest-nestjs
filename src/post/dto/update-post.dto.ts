import { Field, InputType } from '@nestjs/graphql';
import { PartialType } from '@nestjs/mapped-types';
import { IsString } from 'class-validator';

import { CreatePostDto } from './create-post.dto';

@InputType()
export class UpdatePostDto extends PartialType(CreatePostDto) {
  @Field()
  @IsString()
  id: string;
}
