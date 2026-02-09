import { Controller, Injectable } from '@nestjs/common';
import { API_VERSION_SCHEME } from 'src/utils/constants/global.constants';
import fs from 'fs';
import { StorageService } from 'src/storage/storage.service';
import * as mammoth from 'mammoth';
import { v4 as uuidv4 } from 'uuid';
import { FileValidator } from './validators/file-validator';

type MammothImage = {
  read: () => Promise<Buffer>;
  contentType: string;
};
export interface FileStorageResponse {
  fileKey: string;
  fileUrl: string;
  duration?: number;
}

@Controller(`${API_VERSION_SCHEME}/documents`)
@Injectable()
export class DocumentService {
  constructor(private storageService: StorageService) {}

  async handleFileStorage(
    buffer: Buffer,
    key: string,
    mimetype: string,
  ): Promise<FileStorageResponse | null> {
    console.log('handleFileStorage called:', {
      bufferSize: buffer.length,
      key,
      mimetype,
    });

    if (FileValidator.isImage(mimetype)) {
      console.log('Uploading as image...');
      return await this.storageService.uploadImageToBucket(
        buffer,
        key,
        mimetype,
      );
    } else if (
      FileValidator.isAudio(mimetype) ||
      FileValidator.isVideo(mimetype)
    ) {
      console.log('Uploading as audio/video...');
      return await this.storageService.uploadAudioVideoToBucket(
        buffer,
        key,
        mimetype,
      );
    } else if (FileValidator.isWordDocument(mimetype)) {
      console.log('Word document detected, returning placeholder');
      return {
        fileKey: 'none',
        fileUrl: 'none',
        duration: 0,
      };
    }

    console.warn('Unknown mimetype, no handler matched');
    return null;
  }

  fileToBuffer(filePath: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const stream = fs.createReadStream(filePath);

      stream.on('data', (chunk) =>
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)),
      );
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    });
  }

  async convertWordToHtml(
    fileBuffer: Buffer,
    baseKey: string,
  ): Promise<{
    html: string;
    messages: any[];
    listOfImages: string[];
    biblePassages: {
      book: string;
      chapters: {
        number: number;
        startVerse?: number;
        endVerse?: number;
      }[];
    }[];
  }> {
    const listOfImages: string[] = [];
    const { value, messages } = await mammoth.convertToHtml(
      { buffer: fileBuffer },
      {
        convertImage: mammoth.images.imgElement((image: MammothImage) => {
          return (async () => {
            const imageBuffer = await image.read();
            const imageKey = `${baseKey}/${uuidv4()}.png`;

            const { fileUrl } = await this.storageService.uploadImageToBucket(
              imageBuffer,
              imageKey,
              'image/png',
            );

            listOfImages.push(fileUrl);

            return { src: fileUrl };
          })();
        }),
      },
    );

    // Post-processing
    let processedHtml = value;

    // 1. Replace **text** → blockquotes
    processedHtml = processedHtml.replace(
      /\*\*(.*?)\*\*/g,
      '<blockquote>$1</blockquote>',
    );

    // Regex to find $$...$$ wrapped passages
    const passageWrapperRegex = /\$\$(.*?)\$\$/g;

    // Regex to extract book, chapter, and verse or verse range
    // Examples it handles:
    // - John 3:16
    // - 1 John 4:1-8
    // - Ephesians 3:1-19
    // - 2 Samuel 22-23
    // - 2 Samuel 22:1-23:10
    // - Matthew 7:1-6;8:1-23

    interface BibleChapter {
      number: number;
      startVerse?: number;
      endVerse?: number;
    }

    interface BiblePassage {
      book: string;
      chapters: BibleChapter[];
    }

    const biblePassages: BiblePassage[] = [];

    // Collect all matches first
    const matches: RegExpExecArray[] = [];
    let match: RegExpExecArray | null;
    while ((match = passageWrapperRegex.exec(processedHtml)) !== null) {
      matches.push(match);
    }

    // Function to parse complex Bible passages
    const parseBiblePassage = (passageText: string): BiblePassage | null => {
      // Remove extra whitespace
      const cleanText = passageText.trim();

      // Handle multiple passages separated by semicolon (e.g., "Matthew 7:1-6;8:1-23")
      if (cleanText.includes(';')) {
        const parts = cleanText.split(';');
        const firstPassage = parseBiblePassage(parts[0].trim());
        if (!firstPassage) return null;

        // Parse remaining parts and combine chapters
        for (let i = 1; i < parts.length; i++) {
          const part = parts[i].trim();
          // If it starts with a number, it's likely a chapter continuation
          if (/^\d+/.test(part)) {
            const chapterMatch = part.match(/^(\d+)(?::(\d+)(?:-(\d+))?)?/);
            if (chapterMatch) {
              const chapterNum = parseInt(chapterMatch[1]);
              const startVerse = chapterMatch[2]
                ? parseInt(chapterMatch[2])
                : undefined;
              const endVerse = chapterMatch[3]
                ? parseInt(chapterMatch[3])
                : undefined;

              firstPassage.chapters.push({
                number: chapterNum,
                startVerse,
                endVerse,
              });
            }
          } else {
            // It's a new book reference, parse separately
            const additionalPassage = parseBiblePassage(part);
            if (additionalPassage) {
              firstPassage.chapters.push(...additionalPassage.chapters);
            }
          }
        }
        return firstPassage;
      }

      // Main regex for single passage
      // Handles: "Book Chapter:Verse-Verse" or "Book Chapter-Chapter" or "Book Chapter:Verse-Chapter:Verse"
      const passageRegex =
        /^(\d?\s?[A-Za-z]+(?:\s[A-Za-z]+)*)\s+(\d+)(?::(\d+))?(?:-(?:(\d+):)?(\d+))?$/;
      const match = passageRegex.exec(cleanText);

      if (!match) return null;

      const book = match[1].trim();
      const startChapter = parseInt(match[2]);
      const startVerse = match[3] ? parseInt(match[3]) : undefined;
      const endChapter = match[4] ? parseInt(match[4]) : undefined;
      const endVerse = match[5] ? parseInt(match[5]) : undefined;

      const chapters: BibleChapter[] = [];

      if (endChapter && endChapter !== startChapter) {
        // Chapter range (e.g., "2 Samuel 22-23" or "2 Samuel 22:1-23:10")
        if (startVerse && endVerse) {
          // Cross-chapter verse range (e.g., "2 Samuel 22:1-23:10")
          chapters.push({
            number: startChapter,
            startVerse,
            endVerse: undefined,
          });
          for (let i = startChapter + 1; i < endChapter; i++) {
            chapters.push({ number: i });
          }
          chapters.push({ number: endChapter, startVerse: 1, endVerse });
        } else {
          // Simple chapter range (e.g., "2 Samuel 22-23")
          for (let i = startChapter; i <= endChapter; i++) {
            chapters.push({ number: i });
          }
        }
      } else {
        // Single chapter (e.g., "John 3:16" or "Ephesians 3:1-19")
        chapters.push({
          number: startChapter,
          startVerse,
          endVerse: endVerse || endVerse,
        });
      }

      return { book, chapters };
    };

    // Process matches in reverse order to avoid index shifting
    for (let i = matches.length - 1; i >= 0; i--) {
      const match = matches[i];
      const passage = match[1].trim(); // text inside $$...$$

      const parsedPassage = parseBiblePassage(passage);

      if (!parsedPassage) {
        processedHtml = processedHtml.replace(
          match[0],
          match[0].replaceAll('$$', ''),
        );
        continue;
      }

      biblePassages.push(parsedPassage);

      processedHtml = processedHtml.replace(
        match[0],
        `<span class="bible-ref" data-book="${parsedPassage.book}" data-chapters='${JSON.stringify(parsedPassage.chapters)}'>${passage}</span>`,
      );
    }

    return { html: processedHtml, messages, listOfImages, biblePassages };
  }
}
