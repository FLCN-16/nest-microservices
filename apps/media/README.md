# Media Microservice

The **Media Service** handles the upload, storage, and retrieval of binary assets (images, videos) for the entire platform. It abstracts the underlying storage provider, allowing for seamless switching between local storage, AWS S3, or ImageKit.

## 🚀 Features

- **Multi-Provider Support**:
  - **AWS S3 / MinIO**: Standard object storage for production.
  - **ImageKit**: Optimized delivery and transformation.
  - **Local Storage**: Simple filesystem storage for development.
- **Auto-Provisioning**: Automatically creates S3 buckets or local directories if they don't exist.
- **Abstraction Layer**: Unified `FileUploader` interface ensures consistent behavior regardless of the backend.

## 🏗 Architecture

### Modules
- **MediaModule**: Configures the appropriate provider based on environment variables.

### Key Components
- **MediaService**: The core logic that selects the strategy (`initS3`, `initLocal`, `initImageKit`) during initialization.

## 🛠 Configuration

| Environment Variable | Description |
|----------------------|-------------|
| `STORAGE_PROVIDER` | `s3`, `imagekit`, or `local` |
| `AWS_ACCESS_KEY_ID` | AWS/MinIO Access Key |
| `AWS_SECRET_ACCESS_KEY` | AWS/MinIO Secret Key |
| `AWS_BUCKET_NAME` | Target S3 Bucket |
| `S3_ENDPOINT` | Custom endpoint (required for MinIO) |
| `IMAGEKIT_PRIVATE_KEY` | Required if provider is `imagekit` |
| `UPLOAD_DIR` | Directory path for local storage |

## 📦 Dependencies
- `@aws-sdk/client-s3`
- `@imagekit/nodejs`
- `uuid`
