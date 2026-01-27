import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { PostDto, UserSummaryDto } from './dto/post.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class FeedService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
  ) {}

  async create(createPostDto: any): Promise<PostDto> {
    // Demo implementation
    const post = this.postsRepository.create({
      ...createPostDto,
      authorDetails: {
        id: 'user-123',
        username: 'demo_user',
        email: 'private@email.com', // Should be masked in output
        phoneNumber: '+1234567890', // Should be masked in output
      },
    });
    const savedPost = await this.postsRepository.save(post);
    return this.transformToDto(
      Array.isArray(savedPost) ? savedPost[0] : savedPost,
    );
  }

  async findAll(): Promise<PostDto[]> {
    const posts = await this.postsRepository.find();
    return posts.map((post) => this.transformToDto(post));
  }

  private transformToDto(post: Post): PostDto {
    // Map entity to DTO structure
    const postDtoData = {
      ...post,
      author: new UserSummaryDto(post.authorDetails),
    };

    // Apply transformation (validates @Exclude logic)
    return plainToInstance(PostDto, postDtoData, {
      excludeExtraneousValues: true,
    });
  }
}
