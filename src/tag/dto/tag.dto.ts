import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class TagDto {
  @Field()
  id: string;

  @Field()
  name: string;
}
