import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { Media } from './models/media.model';

@Resolver(() => Media)
export class MediaResolver {
  constructor() {}

  @Query(() => [Media], { name: 'mediaList' })
  async getMediaList(
    @Args('userId', { type: () => ID, nullable: true }) _userId?: string, // Prefixed with underscore
  ): Promise<Media[]> {
    // TODO: Implement media metadata storage and retrieval
    // For now, return empty array
    return [];
  }

  @Query(() => Media, { name: 'media', nullable: true }) // Kept 'name: media' as it was not explicitly removed in the provided diff for this query
  async getMedia(
    @Args('id', { type: () => ID }) _id: string, // Prefixed with underscore
  ): Promise<Media | null> {
    // Kept original return type for consistency with 'return null'
    // TODO: Implement findOne in service
    return null;
  }

  @Mutation(() => Boolean)
  async deleteMedia(
    @Args('id', { type: () => ID }) _id: string, // Prefixed with underscore
  ): Promise<boolean> {
    // TODO: Implement delete in service
    return true;
  }
}
