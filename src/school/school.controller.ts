import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Logger,
  UseGuards,
  Request,
  Query,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { SchoolService } from './school.service';
import { CreateSchoolDto, UpdateSchoolDto } from './types/school.dto';
import { AuthGuard } from '../auth/auth.guard';
import { UserDocument } from '../user/schemas/user.schema';
import { SchoolDocument } from './schemas/school.schema';

interface AuthenticatedRequest extends Request {
  user: UserDocument;
}

@Controller('api/v1/school')
@UseGuards(AuthGuard)
export class SchoolController {
  private readonly logger = new Logger(SchoolController.name);

  constructor(private readonly schoolService: SchoolService) {}

  @Get()
  async getSchool(
    @Request() req: AuthenticatedRequest,
    @Query('id') id?: string,
  ): Promise<{
    data: SchoolDocument | null;
    message?: string;
  }> {
    try {
      this.logger.debug({
        message: 'Received request to get school',
        id,
        userSchoolId: req.user?.school_id,
      });

      // If id is provided in query parameter, use it; otherwise use the user's school_id
      const schoolId = id || req.user?.school_id;

      if (!schoolId) {
        this.logger.warn({
          message: 'No school id provided and user has no school_id',
        });
        throw new BadRequestException('No school id provided and user has no school_id');
      }

      const school = await this.schoolService.getSchoolById(schoolId);

      if (!school) {
        throw new NotFoundException(`School with id ${schoolId} not found`);
      }

      return {
        data: school,
        message: 'School retrieved successfully',
      };
    } catch (error) {
      this.logger.error({
        error,
        message: 'Error retrieving school',
      });
      throw error;
    }
  }

  @Post()
  async createSchool(
    @Request() req: AuthenticatedRequest,
    @Body('school') createSchoolDto: CreateSchoolDto,
  ): Promise<{
    data: SchoolDocument;
    message?: string;
  }> {
    try {
      const user = req.user;

      this.logger.debug({
        message: 'Received request to create school',
        createSchoolDto,
        userId: user._id,
      });

      const school = await this.schoolService.createSchool(createSchoolDto, user);

      return {
        data: school,
        message: 'School created successfully',
      };
    } catch (error) {
      this.logger.error({
        error,
        message: 'Error creating school',
      });
      throw error;
    }
  }

  @Put(':id')
  async updateSchool(
    @Param('id') id: string,
    @Body('school') updateSchoolDto: UpdateSchoolDto,
  ): Promise<{
    data: SchoolDocument;
    message?: string;
  }> {
    try {
      this.logger.debug({
        message: `Received request to update school with id: ${id}`,
        updateSchoolDto,
      });

      const school = await this.schoolService.updateSchool(id, updateSchoolDto);

      return {
        data: school,
        message: 'School updated successfully',
      };
    } catch (error) {
      this.logger.error({
        error,
        message: `Error updating school with id: ${id}`,
      });
      throw error;
    }
  }
}
