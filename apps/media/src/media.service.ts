import {
  Injectable,
  OnModuleInit,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  UploadResult,
  FileUploader,
} from './interfaces/file-uploader.interface';
import {
  S3Client,
  PutObjectCommand,
  HeadBucketCommand,
  CreateBucketCommand,
} from '@aws-sdk/client-s3';
import ImageKit, { toFile } from '@imagekit/nodejs';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MediaService implements OnModuleInit {
  private uploader: FileUploader;
  private provider: 's3' | 'imagekit' | 'local';

  onModuleInit() {
    this.provider =
      (process.env.STORAGE_PROVIDER as 's3' | 'imagekit' | 'local') || 's3';
    console.log(`Media Service initialized with provider: ${this.provider}`);

    if (this.provider === 'imagekit') {
      this.initImageKit();
    } else if (this.provider === 'local') {
      this.initLocal();
    } else {
      this.initS3();
    }
  }

  private initLocal() {
    const uploadDir = process.env.UPLOAD_DIR || '/app/uploads';
    const baseUrl =
      process.env.UPLOAD_BASE_URL ||
      `http://localhost:${process.env.PORT || 4003}/uploads`;

    // Ensure upload directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    this.uploader = {
      uploadFile: async (file, folder) => {
        const folderPath = path.join(uploadDir, folder);
        if (!fs.existsSync(folderPath)) {
          fs.mkdirSync(folderPath, { recursive: true });
        }

        const filename = `${uuidv4()}-${file.originalname}`;
        const filePath = path.join(folderPath, filename);

        fs.writeFileSync(filePath, file.buffer);

        return {
          url: `${baseUrl}/${folder}/${filename}`,
          key: `${folder}/${filename}`,
          provider: 'local',
        };
      },
    };
  }

  private initImageKit() {
    const imagekit = new ImageKit({
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY || '',
    });

    this.uploader = {
      uploadFile: async (file, folder) => {
        try {
          const result = await imagekit.files.upload({
            file: await toFile(file.buffer, file.originalname),
            fileName: `${uuidv4()}-${file.originalname}`,
            folder: folder,
          });

          if (!result.url || !result.fileId) {
            throw new InternalServerErrorException(
              'Upload succeeded but response is missing required fields',
            );
          }

          return {
            url: result.url,
            key: result.fileId,
            provider: 'imagekit',
          };
        } catch (error) {
          console.error('ImageKit upload error', error);
          throw new InternalServerErrorException('Upload failed');
        }
      },
    };
  }

  private initS3() {
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    const bucket = process.env.AWS_BUCKET_NAME;

    if (!accessKeyId || !secretAccessKey) {
      throw new InternalServerErrorException(
        'AWS credentials are not configured. Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables.',
      );
    }

    if (!bucket) {
      throw new InternalServerErrorException(
        'AWS bucket is not configured. Please set AWS_BUCKET_NAME environment variable.',
      );
    }

    const s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      endpoint: process.env.S3_ENDPOINT,
      forcePathStyle: true, // Required for MinIO
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    // Ensure bucket exists (helpful for local dev/MinIO)
    this.ensureBucketExists(s3Client, bucket);

    this.uploader = {
      uploadFile: async (file, folder) => {
        const key = `${folder}/${uuidv4()}-${file.originalname}`;
        try {
          await s3Client.send(
            new PutObjectCommand({
              Bucket: bucket,
              Key: key,
              Body: file.buffer,
              ContentType: file.mimetype,
            }),
          );
          // Construct URL (assuming public read or using specific domain)
          const endpoint =
            process.env.S3_ENDPOINT ||
            `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com`;
          // For MinIO, we need the bucket in the URL if path style.
          const url = process.env.S3_ENDPOINT
            ? `${endpoint}/${bucket}/${key}` // MinIO path style
            : `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

          return {
            url,
            key,
            provider: 's3',
          };
        } catch (error) {
          console.error('S3 upload error', error);
          throw new InternalServerErrorException('Upload failed');
        }
      },
    };
  }

  private async ensureBucketExists(client: S3Client, bucket: string) {
    try {
      await client.send(new HeadBucketCommand({ Bucket: bucket }));
    } catch (error) {
      if (
        error.name === 'NotFound' ||
        error.$metadata?.httpStatusCode === 404
      ) {
        console.log(`Bucket ${bucket} not found, creating...`);
        try {
          await client.send(new CreateBucketCommand({ Bucket: bucket }));
          console.log(`Bucket ${bucket} created successfully.`);
        } catch (createError) {
          console.error(`Failed to create bucket ${bucket}:`, createError);
        }
      } else {
        console.error(`Error checking bucket ${bucket}:`, error);
      }
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'general',
  ): Promise<UploadResult> {
    if (!this.uploader) {
      throw new InternalServerErrorException(
        'Storage provider not initialized',
      );
    }
    return this.uploader.uploadFile(file, folder);
  }
}
