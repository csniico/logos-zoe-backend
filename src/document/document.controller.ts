import {
  BadRequestException,
  Controller,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { DocumentService } from './document.service';
import { FileInterceptor } from '@nestjs/platform-express';
import path from 'path';
import { API_VERSION_SCHEME } from 'src/utils/constants/global.constants';
import {
  AudioFileUploadDto,
  ImageDocumentUploadDto,
  WordDocumentUploadDto,
} from './dto/imageDocumentUpload.dto';
import { FileValidator } from './validators/file-validator';

const MAX_IMAGE_SIZE_B: number = 1024 * 1024 * 5;
const TEMP_DEST = path.resolve('/tmp');

@Controller(`${API_VERSION_SCHEME}/documents`)
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  private _validateUploadedFile(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    const { filename, mimetype, path: filePath } = file;

    if (!filename || !mimetype || !filePath) {
      throw new BadRequestException('Missing required file properties');
    }
  }

  @Post('/images')
  @UseInterceptors(
    FileInterceptor('image-file', {
      limits: { fileSize: MAX_IMAGE_SIZE_B },
      dest: TEMP_DEST,
    }),
  )
  async handleImageUploads(
    @UploadedFile() file: Express.Multer.File,
    @Query() query: ImageDocumentUploadDto,
  ) {
    this._validateUploadedFile(file);

    const { key } = query;
    const { filename, mimetype, path: filePath } = file;
    FileValidator.validateImage(mimetype);

    const buffer = await this.documentService.fileToBuffer(
      path.resolve(filePath),
    );

    const serviceResponse = await this.documentService.handleFileStorage(
      buffer,
      `${key}/${filename}.${mimetype.split('/')[1]}`,
      mimetype,
    );

    if (!serviceResponse) throw new BadRequestException();
    const { fileKey, fileUrl } = serviceResponse;

    return {
      fileKey,
      fileUrl,
    };
  }

  @Post('/word-documents')
  @UseInterceptors(
    FileInterceptor('word-document', {
      dest: TEMP_DEST,
    }),
  )
  async handleWordDocumentUploads(
    @UploadedFile() file: Express.Multer.File,
    @Query() query: WordDocumentUploadDto,
  ) {
    this._validateUploadedFile(file);

    const { key } = query;
    const { mimetype, path: filePath } = file;
    FileValidator.validateWord(mimetype);

    const buffer = await this.documentService.fileToBuffer(
      path.resolve(filePath),
    );

    const { html, messages, listOfImages, biblePassages } =
      await this.documentService.convertWordToHtml(buffer, key);
    return { html, messages, listOfImages, biblePassages };
  }

  @Post('/audios')
  @UseInterceptors(
    FileInterceptor('audio-file', {
      dest: TEMP_DEST,
    }),
  )
  async handleAudioUploads(
    @UploadedFile() file: Express.Multer.File,
    @Query() query: AudioFileUploadDto,
  ) {
    console.log('=== Audio Upload Request ===');
    console.log('Query params:', query);
    console.log('File received:', file ? 'YES' : 'NO');

    if (file) {
      console.log('File details:', {
        fieldname: file.fieldname,
        originalname: file.originalname,
        encoding: file.encoding,
        mimetype: file.mimetype,
        size: file.size,
        destination: file.destination,
        filename: file.filename,
        path: file.path,
      });
    }

    try {
      this._validateUploadedFile(file);
      console.log('File validation passed');

      const { key } = query;
      const { filename, mimetype, path: filePath } = file;

      console.log('Validating audio mimetype:', mimetype);
      FileValidator.validateAudio(mimetype);
      console.log('Audio validation passed');

      console.log('Converting file to buffer from path:', filePath);
      const buffer = await this.documentService.fileToBuffer(
        path.resolve(filePath),
      );
      console.log('Buffer created, size:', buffer.length, 'bytes');

      const storageKey = `${key}/${filename}.${mimetype.split('/')[1]}`;
      console.log('Storage key:', storageKey);

      console.log('Uploading to storage...');
      const serviceResponse = await this.documentService.handleFileStorage(
        buffer,
        storageKey,
        mimetype,
      );

      if (!serviceResponse) {
        console.error('Storage service returned null/undefined');
        throw new BadRequestException('Failed to upload audio file');
      }

      const { fileKey, fileUrl, duration } = serviceResponse;
      console.log('Upload successful:', { fileKey, fileUrl, duration });

      return {
        fileKey,
        fileUrl,
        duration,
      };
    } catch (error) {
      console.error('=== Audio Upload Error ===');
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      throw error;
    }
  }

  @Post('/videos')
  async handleVideoUploads() {}
}
