import { ObjectType, Field, ID, InputType } from '@nestjs/graphql';

@ObjectType()
export class UserSummary {
  @Field(() => ID)
  id: string;

  @Field()
  username: string;
}

@ObjectType()
export class Post {
  @Field(() => ID)
  id: string;

  @Field()
  content: string;

  @Field(() => UserSummary)
  author: UserSummary;

  @Field()
  createdAt: Date;

  @Field({ nullable: true })
  updatedAt?: Date;
}

@InputType()
export class CreatePostInput {
  @Field()
  content: string;

  @Field({ nullable: true })
  imageUrl?: string;
}

@InputType()
export class UpdatePostInput {
  @Field({ nullable: true })
  content?: string;

  @Field({ nullable: true })
  imageUrl?: string;
}
