import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import ffprobePath from 'ffprobe-static';

ffmpeg.setFfmpegPath(ffmpegPath!);
ffmpeg.setFfprobePath(ffprobePath.path);

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
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

  /**
   * Compress images using Sharp with higher quality settings.
   */
  private async compressImage(
    mimeType: string,
    buffer: Buffer,
  ): Promise<Buffer> {
    const resizeOptions = {
      height: 250,
      withoutEnlargement: true,
    };

    const _buffer = buffer;

    switch (mimeType) {
      case 'image/jpeg':
      case 'image/jpg':
        await sharp(_buffer)
          .resize(resizeOptions)
          .jpeg({ quality: 90, mozjpeg: true })
          .toBuffer();
        break;
      case 'image/png':
        await sharp(_buffer)
          .resize(resizeOptions)
          .png({ compressionLevel: 6 })
          .toBuffer();
        break;
      case 'image/webp':
        await sharp(_buffer)
          .resize(resizeOptions)
          .webp({ quality: 95 })
          .toBuffer();
        break;
      default:
        break;
    }

    return _buffer;
  }

  /**
   * Compress audio/video using FFmpeg.
   */
  private async processWithFFmpeg(
    buffer: Buffer,
    mimeType: string,
  ): Promise<{ buffer: Buffer; duration: number }> {
    return new Promise((resolve, reject) => {
      const inputPath = path.join('/tmp', `input-${uuidv4()}`);
      const outputPath = path.join('/tmp', `output-${uuidv4()}.mp3`);

      fs.writeFileSync(inputPath, buffer);

      ffmpeg.ffprobe(inputPath, (err, metadata) => {
        if (err)
          return reject(err instanceof Error ? err : new Error(String(err)));

        const duration = metadata.format.duration || 0;

        let command = ffmpeg(inputPath);
        let shouldTranscode = true;

        // Detect bitrate
        const stream = metadata.streams.find((s) => s.codec_type === 'audio');
        const bitrate = stream?.bit_rate
          ? parseInt(stream.bit_rate) / 1000
          : null;

        // Policy:
        if (mimeType === 'audio/wav' || mimeType === 'audio/pcm') {
          shouldTranscode = true; // Always compress uncompressed
        } else if (bitrate && bitrate <= 96) {
          shouldTranscode = false; // Already small enough
        }

        if (shouldTranscode) {
          command = command
            .audioCodec('libmp3lame')
            .audioBitrate('64k')
            .audioChannels(1) // force mono
            .format('mp3');
        } else {
          command = command.outputOptions(['-c copy']);
        }

        command
          .save(outputPath)
          .on('end', () => {
            const processedBuffer = fs.readFileSync(outputPath);
            fs.unlinkSync(inputPath);
            fs.unlinkSync(outputPath);
            resolve({ buffer: processedBuffer, duration });
          })
          .on('error', (err) => {
            reject(err);
          });
      });
    });
  }

  async uploadImageToBucket(buffer: Buffer, key: string, mimeType: string) {
    console.log('I am here though');
    const ext = key.includes('.') ? key.substring(key.lastIndexOf('.')) : '';
    const base = key.replace(ext, '');
    const finalKey = `${base}-${uuidv4()}${ext}`.replaceAll(' ', '_');

    const processedBuffer = await this.compressImage(mimeType, buffer);

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: finalKey,
      Body: processedBuffer,
      ContentType: mimeType,
    });

    await this.storageClient.send(command);
    const data = {
      fileUrl: `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${finalKey}`,
      fileKey: finalKey,
    };

    return data;
  }

  async uploadAudioVideoToBucket(
    buffer: Buffer,
    key: string,
    mimeType: string,
  ) {
    console.log('=== uploadAudioVideoToBucket ===');
    console.log('Input:', {
      bufferSize: buffer.length,
      key,
      mimeType,
    });

    const ext = key.includes('.') ? key.substring(key.lastIndexOf('.')) : '';
    const base = key.replace(ext, '');
    const finalKey = `${base}-${uuidv4()}${ext}`.replaceAll(' ', '_');
    console.log('Generated final key:', finalKey);

    try {
      // Process audio/video with FFmpeg
      console.log('Starting FFmpeg processing...');
      const { buffer: processedBuffer, duration } =
        await this.processWithFFmpeg(buffer, mimeType);
      console.log(
        'FFmpeg processing complete. Processed buffer size:',
        processedBuffer.byteLength / 1024,
        'KB',
        'Duration:',
        duration,
      );

      console.log('Uploading to S3...');
      console.log('S3 Config:', {
        bucket: this.bucketName,
        region: this.region,
        key: finalKey,
        contentType: mimeType,
      });

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: finalKey,
        Body: processedBuffer, // NOTE: Using processedBuffer, not original buffer
        ContentType: 'audio/mpeg', // FFmpeg outputs MP3
      });

      await this.storageClient.send(command);
      console.log('S3 upload successful');

      const result = {
        fileUrl: `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${finalKey}`,
        fileKey: finalKey,
        duration,
      };
      console.log('Returning result:', result);

      return result;
    } catch (error) {
      console.error('=== uploadAudioVideoToBucket Error ===');
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      throw error;
    }
  }

  async deleteFromBucket(fileKey: string) {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: fileKey,
    });

    await this.storageClient.send(command);

    const data = {
      message: 'File deleted successfully',
      fileKey,
    };

    return data;
  }
}
