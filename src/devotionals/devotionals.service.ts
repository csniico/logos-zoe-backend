import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { StorageService } from 'src/storage/storage.service';
import { Devotional } from './schema/devotionals.schema';
import { Model, MongooseError, ObjectId, FilterQuery } from 'mongoose';
import { createDevotionalDto } from './dto/createDevotional.dto';
import { setDevotionalImageDto } from './dto/setDevotionalImage.dto';
import { setDevotionalDocumentDto } from './dto/setDevotionalDocument.dto';

@Injectable()
export class DevotionalsService {
  constructor(
    @InjectModel(Devotional.name)
    private readonly devotionalModel: Model<Devotional>,
    private storageService: StorageService,
  ) {}

  async createDevotionalMetadata(metadata: createDevotionalDto) {
    try {
      const existingDevotional = await this.devotionalModel.findOne({
        day: metadata.day,
        month: metadata.month,
        year: metadata.year,
      });
      if (existingDevotional) {
        throw new BadRequestException(
          'A devotional for this date already exists',
        );
      }
      const devotional = new this.devotionalModel({
        author: metadata.author,
        title: metadata.title,
        day: metadata.day,
        month: metadata.month,
        year: metadata.year,
        questions: metadata.questions,
        scripture: metadata.scripture,
      });
      const data = await devotional.save();
      return data;
    } catch (error) {
      console.error(error);
      if (error instanceof MongooseError) {
        return new BadRequestException(error.message);
      }
      throw new BadRequestException(
        error,
        'Either a devotional with this data already exists or you are passing wrong values for the fields',
      );
    }
  }

  async setDevotionalImageUriAndKey(body: setDevotionalImageDto) {
    try {
      const devotional = await this.devotionalModel.findById(body.devotionalId);
      if (!devotional) {
        throw new NotFoundException();
      }
      devotional.fileUrl = body.fileUrl;
      devotional.fileKey = body.fileKey;

      await devotional.save();
      return devotional;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException();
    }
  }

  async setDevotionalContentAndContentMetdata(body: setDevotionalDocumentDto) {
    try {
      const devotional = await this.devotionalModel.findById(body.devotionalId);
      if (!devotional) {
        throw new NotFoundException();
      }
      devotional.content = body.content;
      devotional.biblePassages = body.biblePassages || [];
      devotional.listOfImageAssets = body.listOfImageAssets || [];

      await devotional.save();
      return devotional;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException();
    }
  }

  async getPages(limit: number) {
    const devotionalCount = await this.devotionalModel.countDocuments({
      isDeleted: { $ne: true },
    });
    const totalPages = Math.ceil(devotionalCount / limit);
    return { totalPages };
  }

  async getMany(
    offset: number,
    limit: number,
    search?: string,
    month?: string,
    year?: string,
    author?: string,
    type?: string,
  ) {
    try {
      console.log('getMany called with:', {
        offset,
        limit,
        search,
        month,
        year,
        author,
        type,
      });

      // Build the filter query
      const filter: FilterQuery<Devotional> = { isDeleted: { $ne: true } };

      // Add search filter (searches in title, author, scripture, questions, content)
      if (search && search.trim()) {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { author: { $regex: search, $options: 'i' } },
          { scripture: { $regex: search, $options: 'i' } },
          { questions: { $regex: search, $options: 'i' } },
          { content: { $regex: search, $options: 'i' } },
        ];
      }

      // Add specific field filters
      // For month, convert number to month name since DB stores "January", "February", etc.
      if (month && month.trim()) {
        const monthNames = [
          'January',
          'February',
          'March',
          'April',
          'May',
          'June',
          'July',
          'August',
          'September',
          'October',
          'November',
          'December',
        ];

        const monthNum = parseInt(month, 10);
        const monthFormats = [
          month, // Original (in case some are stored as numbers)
          monthNum.toString(), // Without leading zero "2"
          monthNum.toString().padStart(2, '0'), // With leading zero "02"
        ];

        // Add the month name if the number is valid
        if (monthNum >= 1 && monthNum <= 12) {
          monthFormats.push(monthNames[monthNum - 1]);
        }

        filter.month = { $in: monthFormats };
      }

      if (year && year.trim()) {
        filter.year = year;
      }

      if (author && author.trim()) {
        filter.author = { $regex: author, $options: 'i' };
      }

      if (type && type.trim()) {
        filter.type = type;
      }

      console.log('MongoDB filter:', JSON.stringify(filter, null, 2));

      // Get total count with filters
      const total = await this.devotionalModel.countDocuments(filter);

      console.log('Total matching documents:', total);

      // Fetch devotionals with pagination, sorted by creation date (newest first)
      const devotionals = await this.devotionalModel
        .find(filter)
        .sort({ createdAt: -1 }) // Sort by newest first
        .skip(offset)
        .limit(limit)
        .exec();

      console.log('Returned devotionals count:', devotionals.length);

      return {
        devotionals,
        total,
        offset,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error('Error fetching devotionals:', error);
      throw new InternalServerErrorException('Failed to fetch devotionals');
    }
  }

  async getStats() {
    try {
      const currentDate = new Date();
      const currentMonth = (currentDate.getMonth() + 1).toString(); // MongoDB months are 1-12, JS months are 0-11
      const currentYear = currentDate.getFullYear().toString();

      // Get 7 days ago for "recently added"
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(currentDate.getDate() - 7);

      // Total count (excluding deleted)
      // Use $ne: true to include documents where isDeleted is false, undefined, or null
      const total = await this.devotionalModel.countDocuments({
        isDeleted: { $ne: true },
      });

      // This month count
      const thisMonth = await this.devotionalModel.countDocuments({
        month: currentMonth,
        year: currentYear,
        isDeleted: { $ne: true },
      });

      // This year count
      const thisYear = await this.devotionalModel.countDocuments({
        year: currentYear,
        isDeleted: { $ne: true },
      });

      // Recently added (last 7 days) using createdAt timestamp
      const recentlyAdded = await this.devotionalModel.countDocuments({
        createdAt: { $gte: sevenDaysAgo },
        isDeleted: { $ne: true },
      });

      return {
        total,
        thisMonth,
        thisYear,
        recentlyAdded,
      };
    } catch (error) {
      console.error('Error getting devotional stats:', error);
      throw new InternalServerErrorException(
        'Failed to retrieve devotional statistics',
      );
    }
  }

  async softDelete(id: ObjectId | string) {
    const devotional = await this.devotionalModel.findById(id);
    if (!devotional || devotional.isDeleted === true) {
      throw new NotFoundException('Devotional not found');
    }

    devotional.isDeleted = true;
    devotional.deletedAt = new Date();
    devotional.published = false; // Unpublish when soft deleting
    await devotional.save();
    return { message: 'Devotional soft-deleted' };
  }

  async restore(id: ObjectId | string) {
    const devotional = await this.devotionalModel.findById(id);
    if (!devotional || devotional.isDeleted !== true) {
      throw new NotFoundException('Devotional not found or not deleted');
    }

    devotional.isDeleted = false;
    devotional.deletedAt = undefined;
    await devotional.save();
    return { message: 'Devotional restored' };
  }

  async deleteById(id: ObjectId) {
    // Keeping this for hard delete if needed, but usually we use soft delete
    return this.softDelete(id);
  }

  async getOne(id: ObjectId | string) {
    try {
      const devotional = await this.devotionalModel.findById(id);
      if (!devotional || devotional.isDeleted === true) {
        throw new NotFoundException('Devotional not found');
      }
      return devotional;
    } catch (error) {
      console.error('Error fetching devotional:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch devotional');
    }
  }

  async updateDevotionalMetadata(
    id: ObjectId,
    body: {
      day?: string;
      month?: string;
      year?: string;
      title?: string;
      scripture?: string;
      questions?: string;
      author?: string;
      type?: string;
    },
  ) {
    try {
      const devotional = await this.devotionalModel.findById(id);
      if (!devotional || devotional.isDeleted === true) {
        throw new NotFoundException('Devotional not found');
      }

      // Update only provided fields
      if (body.day !== undefined) devotional.day = String(body.day);
      if (body.month !== undefined) devotional.month = String(body.month);
      if (body.year !== undefined) devotional.year = String(body.year);
      if (body.title !== undefined) devotional.title = body.title;
      if (body.scripture !== undefined) devotional.scripture = body.scripture;
      if (body.questions !== undefined) devotional.questions = body.questions;
      if (body.author !== undefined) devotional.author = body.author;
      if (body.type !== undefined) devotional.type = body.type;

      await devotional.save();
      return devotional;
    } catch (error) {
      console.error('Error updating devotional metadata:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to update devotional metadata',
      );
    }
  }

  async updatePublishedState(id: ObjectId | string, published: boolean) {
    const devotional = await this.devotionalModel.findById(id);
    if (!devotional) {
      throw new NotFoundException('Devotional not found');
    }
    if (devotional.isDeleted === true) {
      throw new BadRequestException('Cannot publish a deleted devotional');
    }
    devotional.published = published;
    await devotional.save();
    return { message: `Devotional ${published ? 'published' : 'unpublished'}` };
  }

  async addHit(id: ObjectId | string, hit: string) {
    const devotional = await this.devotionalModel.findById(id);
    if (!devotional || devotional.isDeleted === true) {
      throw new NotFoundException('Devotional not found');
    }
    if (!devotional.hits) {
      devotional.hits = [];
    }
    devotional.hits.push(hit);
    await devotional.save();
    return { message: 'Hit recorded' };
  }

  async getHits(id: ObjectId | string) {
    const devotional = await this.devotionalModel.findById(id);
    if (!devotional || devotional.isDeleted === true) {
      throw new NotFoundException('Devotional not found');
    }
    return { hits: devotional.hits || [] };
  }
}
