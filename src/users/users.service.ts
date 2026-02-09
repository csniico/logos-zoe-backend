import { InjectModel } from '@nestjs/mongoose';
import { loginUserDto } from './dto/loginUser.dto';
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { User } from './schema/user.schema';
import mongoose, { Model } from 'mongoose';
import {
  comparePassword,
  hashPassword,
} from 'src/utils/cryptography/bcrypt.util';
import { createUserDto } from './dto/createUser.dto';
import { updateUserDto } from './dto/updateUser.dto';
import { updatePasswordDto } from './dto/updatePassword.dto';
import { getUsersDto } from './dto/getUsers.dto';
import { verifyEmailDto } from './dto/verifyEmail.dto';
import { sendMail } from 'src/utils/mailer/mailer.worker.util';
import { USER_FOUND_MESSAGE } from 'src/utils/constants/global.constants';
import { AddBookmarkDto, RemoveBookmarkDto } from './dto/bookmark.dto';
import { UpdateProfileDto } from './dto/updateProfile.dto';
import { StorageService } from 'src/storage/storage.service';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly storageService: StorageService,
  ) {}

  async getUsers(dto: getUsersDto) {
    try {
      const { page, limit } = dto;
      const _users = await this.userModel
        .find({}, { password: 0 })
        .skip((page - 1) * limit)
        .limit(limit);

      return {
        message: 'Users found',
        total: _users.length,
        page,
        limit,
        data: _users,
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'An error occurred while fetching users',
      );
    }
  }

  async login(dto: loginUserDto) {
    try {
      const _user = await this.userModel.findOne({ email: dto.email });
      if (!_user) {
        throw new NotFoundException('User not found');
      }

      const passwordMatches = await comparePassword(
        dto.password,
        _user.password,
      );
      if (!passwordMatches) {
        this.logger.log('Password comparison returned a not-match');
        throw new UnauthorizedException('Incorrect Password');
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userWithoutPassword } = _user.toObject();

      return {
        message: USER_FOUND_MESSAGE,
        data: userWithoutPassword,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An error occurred while logging in the user',
      );
    }
  }

  async createUser(dto: createUserDto) {
    try {
      const userExists = await this.userModel.findOne({ email: dto.email });
      if (userExists) {
        // redirect the user to verify their email instead of throwing an error
        throw new ConflictException('User already exists');
      }

      const newUser = new this.userModel({
        email: dto.email,
        firstname: dto.firstname,
        lastname: dto.lastname,
        password: await hashPassword(dto.password),
        role: 'user',
      });

      await newUser.save();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userWithoutPassword } = newUser.toObject();

      return {
        message: 'User created successfully',
        data: userWithoutPassword,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An error occurred while creating the user',
      );
    }
  }

  async updateUser(id: string, dto: updateUserDto) {
    try {
      const user = await this.userModel.findById({ _id: id });

      if (!user) throw new NotFoundException('User not found. Invalid Id');

      const updatedUser = await this.userModel.findByIdAndUpdate(
        {
          _id: id,
        },
        {
          $set: {
            firstname: dto.firstname,
            lastname: dto.lastname,
          },
        },
        { new: true },
      );
      await updatedUser?.save();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...updatedUserWithoutPassword } =
        updatedUser!.toObject();

      return {
        message: 'User updated successfully',
        data: updatedUserWithoutPassword,
      };
    } catch (error) {
      if (error instanceof mongoose.Error) {
        console.error('Mongoose error:', error.message);
      } else {
        console.error('General error:', (error as Error).message);
      }
      throw new InternalServerErrorException(
        'An error occurred while creating the user',
      );
    }
  }

  async updatePassword(id: string, dto: updatePasswordDto) {
    try {
      const user = await this.userModel.findById({ _id: id });

      if (!user) throw new NotFoundException('User not found. Invalid Id');

      const updatedUser = await this.userModel.findByIdAndUpdate(
        {
          _id: id,
        },
        {
          $set: {
            password: await hashPassword(dto.password),
          },
        },
        { new: true },
      );
      await updatedUser?.save();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...updatedUserWithoutPassword } =
        updatedUser!.toObject();

      return {
        message: 'Password updated successfully',
        data: updatedUserWithoutPassword,
      };
    } catch (error) {
      if (error instanceof mongoose.Error) {
        console.error('Mongoose error:', error.message);
      } else {
        console.error('General error:', (error as Error).message);
      }
      throw new InternalServerErrorException(
        'An error occurred while creating the user',
      );
    }
  }

  async findUser(id: string) {
    try {
      const _user = await this.userModel.findById(id, { password: 0 });

      if (!_user) {
        throw new NotFoundException('User not found');
      }

      return {
        message: USER_FOUND_MESSAGE,
        data: _user.toObject(),
      };
    } catch (error) {
      console.error('Error in findUser:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error finding user');
    }
  }

  async updateProfile(id: string, userData: UpdateProfileDto) {
    try {
      const updateData: Partial<User> = {};

      if (userData.firstname) updateData.firstname = userData.firstname;
      if (userData.lastname) updateData.lastname = userData.lastname;
      if (userData.avatar) updateData.avatar = userData.avatar;

      // Check if email is being updated
      if (userData.email) {
        // Check if email already exists for another user
        const existingUser = await this.userModel.findOne({
          email: userData.email,
          _id: { $ne: id },
        });

        if (existingUser) {
          throw new ConflictException('Email already in use');
        }

        updateData.email = userData.email;
      }

      const _user = await this.userModel.findByIdAndUpdate(id, updateData, {
        new: true,
        select: { password: 0 },
      });

      if (!_user) {
        throw new NotFoundException('User not found');
      }

      return {
        message: 'Profile updated successfully',
        data: _user.toObject(),
      };
    } catch (error) {
      console.error('Error updating profile:', error);
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Error updating profile');
    }
  }

  async updateProfilePicture(id: string, file: Express.Multer.File) {
    try {
      if (!file) {
        throw new BadRequestException('No file uploaded');
      }

      // Validate file type
      const allowedMimeTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
      ];
      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new BadRequestException(
          'Invalid file type. Only JPEG, PNG, and WebP images are allowed',
        );
      }

      // Upload to S3
      const uploadResult = await this.storageService.uploadImageToBucket(
        file.buffer,
        `avatars/${Date.now()}_${file.originalname}`,
        file.mimetype,
      );

      // Update user avatar in database
      const _user = await this.userModel.findByIdAndUpdate(
        id,
        { avatar: uploadResult.fileUrl },
        { new: true, select: { password: 0 } },
      );

      if (!_user) {
        throw new NotFoundException('User not found');
      }

      return {
        message: 'Profile picture updated successfully',
        data: {
          avatar: uploadResult.fileUrl,
          user: _user.toObject(),
        },
      };
    } catch (error) {
      console.error('Error updating profile picture:', error);
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Error updating profile picture');
    }
  }

  async deleteUser(id: string) {
    try {
      const _user = await this.userModel.findByIdAndDelete(id);

      if (!_user) {
        return new NotFoundException();
      }

      return {
        message: 'success',
      };
    } catch (error) {
      console.error(error);
      return new InternalServerErrorException();
    }
  }

  async verifyEmail(dto: verifyEmailDto) {
    try {
      const _user = await this.userModel.findOne({ email: dto.email });

      if (!_user) {
        return new NotFoundException();
      }

      await sendMail({
        to: _user.email,
        subject: 'Verify your email',
        html: `Click <a href="http://localhost:${process.env.PORT}/verify/${_user.id}">here</a> to verify your email`,
      });

      return {
        message: 'success',
      };
    } catch (error) {
      console.error(error);
      return new InternalServerErrorException();
    }
  }

  // Bookmark Management
  async addBookmark(userId: string, addBookmarkDto: AddBookmarkDto) {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Check if bookmark already exists
      const bookmarkExists = user.bookmarks.some(
        (bookmark) =>
          bookmark.resourceId === addBookmarkDto.resourceId &&
          bookmark.resourceType === addBookmarkDto.resourceType,
      );

      if (bookmarkExists) {
        throw new BadRequestException('Bookmark already exists');
      }

      // Add bookmark
      user.bookmarks.push({
        resourceType: addBookmarkDto.resourceType,
        resourceId: addBookmarkDto.resourceId,
        bookmarkedAt: new Date(),
      });

      await user.save();

      return {
        message: 'Bookmark added successfully',
        data: user.bookmarks,
      };
    } catch (error) {
      this.logger.error('Error adding bookmark:', error);
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to add bookmark');
    }
  }

  async removeBookmark(userId: string, removeBookmarkDto: RemoveBookmarkDto) {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Remove bookmark
      const initialLength = user.bookmarks.length;
      user.bookmarks = user.bookmarks.filter(
        (bookmark) => bookmark.resourceId !== removeBookmarkDto.resourceId,
      );

      if (user.bookmarks.length === initialLength) {
        throw new NotFoundException('Bookmark not found');
      }

      await user.save();

      return {
        message: 'Bookmark removed successfully',
        data: user.bookmarks,
      };
    } catch (error) {
      this.logger.error('Error removing bookmark:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to remove bookmark');
    }
  }

  async getBookmarks(userId: string) {
    try {
      const user = await this.userModel.findById(userId).select('bookmarks');
      if (!user) {
        throw new NotFoundException('User not found');
      }

      return {
        message: 'Bookmarks retrieved successfully',
        data: user.bookmarks,
      };
    } catch (error) {
      this.logger.error('Error getting bookmarks:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to get bookmarks');
    }
  }

  // Preferences Management
  async updatePreferences(userId: string, preferences: any[]) {
    try {
      const user = await this.userModel.findByIdAndUpdate(
        userId,
        { preferences },
        { new: true },
      );

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return {
        message: 'Preferences updated successfully',
        data: user.preferences,
      };
    } catch (error) {
      this.logger.error('Error updating preferences:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update preferences');
    }
  }

  async getPreferences(userId: string) {
    try {
      const user = await this.userModel.findById(userId).select('preferences');
      if (!user) {
        throw new NotFoundException('User not found');
      }

      return {
        message: 'Preferences retrieved successfully',
        data: user.preferences,
      };
    } catch (error) {
      this.logger.error('Error getting preferences:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to get preferences');
    }
  }

  // User Management (Admin)
  async getAllUsers(dto: getUsersDto) {
    try {
      const { page, limit } = dto;
      const skip = (page - 1) * limit;

      const [users, total] = await Promise.all([
        this.userModel
          .find({}, { password: 0 })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        this.userModel.countDocuments().exec(),
      ]);

      return {
        message: 'Users retrieved successfully',
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        data: users,
      };
    } catch (error) {
      this.logger.error('Error getting all users:', error);
      throw new InternalServerErrorException('Failed to retrieve users');
    }
  }

  async getUserById(userId: string) {
    try {
      const user = await this.userModel
        .findById(userId)
        .select('-password')
        .exec();

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return {
        message: 'User retrieved successfully',
        data: user,
      };
    } catch (error) {
      this.logger.error('Error getting user by ID:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to retrieve user');
    }
  }

  async updateUserRole(userId: string, role: string) {
    try {
      const user = await this.userModel.findByIdAndUpdate(
        userId,
        { role },
        { new: true },
      );

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return {
        message: 'User role updated successfully',
        data: { role: user.role },
      };
    } catch (error) {
      this.logger.error('Error updating user role:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update user role');
    }
  }

  async suspendUser(userId: string, isSuspended: boolean) {
    try {
      const updateData: { isSuspended: boolean; suspendedAt: Date | null } = {
        isSuspended,
        suspendedAt: isSuspended ? new Date() : null,
      };

      const user = await this.userModel.findByIdAndUpdate(userId, updateData, {
        new: true,
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return {
        message: `User ${isSuspended ? 'suspended' : 'unsuspended'} successfully`,
        data: {
          isSuspended: user.isSuspended,
          suspendedAt: user.suspendedAt,
        },
      };
    } catch (error) {
      this.logger.error('Error suspending/unsuspending user:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update user status');
    }
  }

  async getUserSessions(userId: string) {
    try {
      const user = await this.userModel
        .findById(userId)
        .select('sessionId email')
        .exec();

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // For now, return basic session info
      // In future, this can be expanded to track multiple sessions
      return {
        message: 'User sessions retrieved successfully',
        data: {
          userId: user._id,
          email: user.email,
          currentSession: user.sessionId || null,
          activeSessions: user.sessionId ? 1 : 0,
        },
      };
    } catch (error) {
      this.logger.error('Error getting user sessions:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to retrieve user sessions',
      );
    }
  }
}
