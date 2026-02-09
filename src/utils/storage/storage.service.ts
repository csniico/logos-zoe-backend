// s3.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private storageClient: S3Client;
  private readonly bucketName: string;
  private readonly region: string;

  constructor(private readonly configService: ConfigService) {
    this.bucketName = this.configService.get<string>('S3_BUCKET_NAME', '');
    this.region = this.configService.get<string>('AWS_REGION', '');

    if (!this.bucketName || !this.region) {
      throw new Error('Missing AWS S3 configuration');
    }

    this.storageClient = new S3Client({ region: this.region });
  }

  uploadImageToBucket() {
    console.log(this.storageClient);
  }
}
