import {
  Controller,
  Get,
  Post,
  Body,
  UseInterceptors,
  ClassSerializerInterceptor,
  UseGuards,
} from '@nestjs/common';
import { FeedService } from './feed.service';
import { PostDto } from './dto/post.dto';
import { TcpAuthGuard } from '@the-falcon/common';

@Controller('feed') // Prefix combined with versioning -> /v1/feed
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Get()
  @UseGuards(TcpAuthGuard('read', 'feed'))
  @UseInterceptors(ClassSerializerInterceptor)
  async findAll(): Promise<PostDto[]> {
    return this.feedService.findAll();
  }

  @Post()
  @UseGuards(TcpAuthGuard('write', 'feed'))
  @UseInterceptors(ClassSerializerInterceptor)
  async create(@Body() createPostDto: any): Promise<PostDto> {
    return this.feedService.create(createPostDto);
  }
}
