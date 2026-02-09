import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schema/user.schema';
import { hashPassword } from 'src/utils/cryptography/bcrypt.util';
import { ConfigService } from '@nestjs/config';
import { Podcast } from 'src/podcast/schema/podcast.schema';

@Injectable()
export class UserSeeder {
  private readonly adminEmail: string;
  private readonly adminPassword: string;
  private readonly userEmail: string;
  private readonly userPassword: string;

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Podcast.name) private podcastModel: Model<Podcast>,
    private readonly configService: ConfigService,
  ) {
    this.adminEmail = this.configService.get<string>('ADMIN_USER_EMAIL', '');
    this.adminPassword = this.configService.get<string>(
      'ADMIN_USER_PASSWORD',
      '',
    );
    this.userEmail = this.configService.get<string>('REGULAR_USER_EMAIL', '');
    this.userPassword = this.configService.get<string>(
      'REGULAR_USER_PASSWORD',
      '',
    );

    if (!this.adminEmail || !this.adminPassword) {
      throw new Error('Missing seeder data for admin');
    }

    if (!this.userEmail || !this.userPassword) {
      throw new Error('Missing seeder data for user');
    }
  }

  async seed() {
    const count = await this.userModel.countDocuments();
    Logger.log(`User document count: ${count}`);

    // Check if admin user exists
    const adminExists = await this.userModel.findOne({
      email: this.adminEmail,
    });
    if (!adminExists) {
      await this.userModel.create({
        email: this.adminEmail,
        password: await hashPassword(this.adminPassword),
        firstname: 'Admin',
        lastname: 'User',
        role: 'super-admin',
      });
      Logger.log(`Admin user created: ${this.adminEmail}`);
    } else {
      Logger.log(`Admin user already exists: ${this.adminEmail}`);
    }

    // Check if test user exists
    const testUserExists = await this.userModel.findOne({
      email: this.userEmail,
    });
    if (!testUserExists) {
      await this.userModel.create({
        email: this.userEmail,
        password: await hashPassword(this.userPassword),
        firstname: 'Regular',
        lastname: 'User',
        role: 'user',
      });
      Logger.log(`Test user created: ${this.userEmail}`);
    } else {
      Logger.log(`Test user already exists: ${this.userEmail}`);
    }
  }
}
