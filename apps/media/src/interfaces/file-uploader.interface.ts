export interface UploadResult {
  url: string;
  key: string; // or fileId
  provider: 's3' | 'imagekit' | 'local';
}

export interface FileUploader {
  uploadFile(file: Express.Multer.File, folder: string): Promise<UploadResult>;
}
