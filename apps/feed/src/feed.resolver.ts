import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { FeedService } from './feed.service';
import { Post, CreatePostInput } from './models/post.model';

@Resolver(() => Post)
export class FeedResolver {
  constructor(private readonly feedService: FeedService) {}

  @Query(() => [Post], { name: 'posts' })
  async getPosts(
    @Args('limit', { type: () => Number, nullable: true, defaultValue: 10 })
    _limit: number,
    @Args('offset', { type: () => Number, nullable: true, defaultValue: 0 })
    _offset: number,
  ): Promise<Post[]> {
    // For now, return all posts (pagination can be added later)
    const posts = await this.feedService.findAll();
    return posts as unknown as Post[];
  }

  @Query(() => Post, { name: 'post', nullable: true })
  async getPost(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Post | null> {
    // TODO: Implement findOne in service
    const posts = await this.feedService.findAll();
    const post = posts.find((p) => p.id === id);
    return (post as unknown as Post) || null;
  }

  @Mutation(() => Post)
  async createPost(@Args('input') input: CreatePostInput): Promise<Post> {
    const post = await this.feedService.create(input);
    return post as unknown as Post;
  }

  @Mutation(() => Boolean)
  async deletePost(
    @Args('id', { type: () => ID }) _id: string,
  ): Promise<boolean> {
    // TODO: Implement delete in service
    return true;
  }
}
