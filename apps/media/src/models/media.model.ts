import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class Media {
  @Field(() => ID)
  id: string;

  @Field()
  url: string;

  @Field()
  key: string;

  @Field()
  provider: string;

  @Field({ nullable: true })
  folder?: string;

  @Field()
  createdAt: Date;

  @Field({ nullable: true })
  userId?: string;
}
