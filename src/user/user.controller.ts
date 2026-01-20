import {
  Controller,
  Get,
  Put,
  Body,
  Logger,
  UseGuards,
  Request,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateProfileDto } from './types/profile-update.dto';
import { GetProfileResponse, UpdateProfileResponse } from './types/profile-response.dto';
import { AuthGuard } from '../auth/auth.guard';
import { UserDocument } from './schemas/user.schema';

interface AuthenticatedRequest extends Request {
  user: UserDocument;
}

@Controller('api/v1')
@UseGuards(AuthGuard)
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(
    private readonly userService: UserService,
  ) { }

  @Get('getProfileDetails')
  async getProfileDetails(
    @Request() req: AuthenticatedRequest,
  ): Promise<GetProfileResponse> {
    try {
      this.logger.debug({
        message: 'Received request to get profile details',
        userId: req.user._id,
      });

      // Populate school when fetching user
      const user = await this.userService.findUserById(
        req.user._id.toString(),
        true, // populateSchool = true
      );

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return {
        data: user as UserDocument,
        message: 'Profile details retrieved successfully',
      };
    } catch (error) {
      this.logger.error({
        error,
        message: 'Error retrieving profile details',
      });
      throw error;
    }
  }

  @Put('updateProfile')
  async updateProfile(
    @Request() req: AuthenticatedRequest,
    @Body('profile') updateProfileDto: UpdateProfileDto,
  ): Promise<UpdateProfileResponse> {
    try {
      this.logger.debug({
        message: 'Received request to update profile',
        userId: req.user._id,
        updateProfileDto,
      });

      const updateData: any = { ...updateProfileDto };

      const updatedUser = await this.userService.updateUser(
        req.user._id.toString(),
        updateData,
      );

      if (!updatedUser) {
        throw new NotFoundException('User not found');
      }

      // Fetch user again with populated school for response
      const user = await this.userService.findUserById(
        req.user._id.toString(),
        true, // populateSchool = true
      );

      return {
        data: user as UserDocument,
        message: 'Profile updated successfully',
      };
    } catch (error) {
      this.logger.error({
        error,
        message: 'Error updating profile',
      });
      throw error;
    }
  }
}
