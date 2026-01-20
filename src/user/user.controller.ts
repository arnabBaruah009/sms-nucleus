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
import { SchoolService } from '../school/school.service';
import { UpdateProfileDto } from './types/profile.dto';
import { GetProfileResponse, UpdateProfileResponse } from './types/profile-response.dto';
import { AuthGuard } from '../auth/auth.guard';
import { UserDocument } from './schemas/user.schema';
import { SchoolDocument } from 'src/school/schemas/school.schema';

interface AuthenticatedRequest extends Request {
  user: UserDocument;
}

@Controller('api/v1')
@UseGuards(AuthGuard)
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(
    private readonly userService: UserService,
    private readonly schoolService: SchoolService,
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

      const user = await this.userService.findUserById(req.user._id.toString());

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Fetch school details if school_id exists
      let school: any;
      if (user.school_id) {
        school = await this.schoolService.getSchoolById(user.school_id);
      }

      const profileDetails = this.userService.transformToProfileDetails(user, school);

      return {
        data: profileDetails,
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

      // Fetch school details if school_id exists
      let school: any;
      if (updatedUser.school_id) {
        school = await this.schoolService.getSchoolById(updatedUser.school_id);
      }

      const profileDetails = this.userService.transformToProfileDetails(updatedUser, school);

      return {
        data: profileDetails,
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
