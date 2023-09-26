import { Field, ObjectType } from '@nestjs/graphql';

import { TagDto } from '../../tag/dto';

@ObjectType()
export class PostDto {
  @Field()
  id: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  description: string;

  @Field(() => [TagDto])
  tags: TagDto[];
}
