import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { createUserDto } from './dto/createUser.dto';
import { updateUserDto } from './dto/updateUser.dto';
import { UserService } from './users.service';
import { loginUserDto } from './dto/loginUser.dto';
import { updatePasswordDto } from './dto/updatePassword.dto';
import { verifyEmailDto } from './dto/verifyEmail.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import type { AuthenticatedRequest } from 'src/auth/types/authenticatedRequest';
import { API_VERSION_SCHEME } from 'src/utils/constants/global.constants';
import { AddBookmarkDto, RemoveBookmarkDto } from './dto/bookmark.dto';
import { UpdateUserRoleDto, SuspendUserDto } from './dto/manage-user.dto';
import { getUsersDto } from './dto/getUsers.dto';
import { UpdateProfileDto } from './dto/updateProfile.dto';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller(`${API_VERSION_SCHEME}/users`)
export class UsersController {
  constructor(private userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/profile')
  getProfile(@Req() req: AuthenticatedRequest) {
    return this.userService.findUser(req.user.id);
  }

  @Post('/signup')
  createUser(@Body() body: createUserDto) {
    return this.userService.createUser(body);
  }

  @Post('/login')
  loginUser(@Body() body: loginUserDto) {
    return this.userService.login(body);
  }

  @UseGuards(JwtAuthGuard)
  @Put()
  updateFirstnameAndLastname(
    @Req() req: AuthenticatedRequest,
    @Body() userData: updateUserDto,
  ) {
    return this.userService.updateUser(req.user.id, userData);
  }

  @UseGuards(JwtAuthGuard)
  @Put('/profile')
  updateProfile(
    @Req() req: AuthenticatedRequest,
    @Body() userData: UpdateProfileDto,
  ) {
    return this.userService.updateProfile(req.user.id, userData);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/profile/avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  async updateProfilePicture(
    @Req() req: AuthenticatedRequest,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.userService.updateProfilePicture(req.user.id, file);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super-admin')
  @Put('/password')
  updatePassword(
    @Req() req: AuthenticatedRequest,
    @Body() userData: updatePasswordDto,
  ) {
    return this.userService.updatePassword(req.user.id, userData);
  }

  @UseGuards(JwtAuthGuard)
  @Delete()
  deleteUser(@Req() req: AuthenticatedRequest) {
    return this.userService.deleteUser(req.user.id);
  }

  @Post('/verify-email')
  verifyEmail(@Body() email: verifyEmailDto) {
    return this.userService.verifyEmail(email);
  }

  // Bookmark Endpoints
  @UseGuards(JwtAuthGuard)
  @Post('/bookmarks')
  addBookmark(
    @Req() req: AuthenticatedRequest,
    @Body() addBookmarkDto: AddBookmarkDto,
  ) {
    return this.userService.addBookmark(req.user.id, addBookmarkDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/bookmarks')
  removeBookmark(
    @Req() req: AuthenticatedRequest,
    @Body() removeBookmarkDto: RemoveBookmarkDto,
  ) {
    return this.userService.removeBookmark(req.user.id, removeBookmarkDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/bookmarks')
  getBookmarks(@Req() req: AuthenticatedRequest) {
    return this.userService.getBookmarks(req.user.id);
  }

  // Preferences Endpoints
  @UseGuards(JwtAuthGuard)
  @Put('/preferences')
  updatePreferences(
    @Req() req: AuthenticatedRequest,
    @Body() body: { preferences: any[] },
  ) {
    return this.userService.updatePreferences(req.user.id, body.preferences);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/preferences')
  getPreferences(@Req() req: AuthenticatedRequest) {
    return this.userService.getPreferences(req.user.id);
  }

  // Admin User Management Endpoints
  @UseGuards(JwtAuthGuard)
  @Get('/all')
  getAllUsers(@Query() query: getUsersDto) {
    return this.userService.getAllUsers(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:userId')
  getUserById(@Param('userId') userId: string) {
    return this.userService.getUserById(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put('/:userId/role')
  updateUserRole(
    @Param('userId') userId: string,
    @Body() updateRoleDto: UpdateUserRoleDto,
  ) {
    return this.userService.updateUserRole(userId, updateRoleDto.role);
  }

  @UseGuards(JwtAuthGuard)
  @Put('/:userId/suspend')
  suspendUser(
    @Param('userId') userId: string,
    @Body() suspendDto: SuspendUserDto,
  ) {
    return this.userService.suspendUser(userId, suspendDto.isSuspended);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:userId/sessions')
  getUserSessions(@Param('userId') userId: string) {
    return this.userService.getUserSessions(userId);
  }
}
