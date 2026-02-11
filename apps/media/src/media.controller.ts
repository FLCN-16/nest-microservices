import {
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';

@Controller('media') // Prefix combined with versioning -> /v1/media
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get('/health')
  healthCheck() {
    return {
      status: 'ok',
      service: 'media',
      timestamp: new Date().toISOString(),
    };
  }

  @MessagePattern({ cmd: 'health' })
  tcpHealthCheck() {
    return { status: 'ok', service: 'media' };
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('folder') folder: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    return this.mediaService.uploadFile(file, folder || 'uploads');
  }
}
