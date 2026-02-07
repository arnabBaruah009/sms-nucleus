import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Logger,
  UseGuards,
  Request,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { TeacherService } from './teacher.service';
import { GetTeachersResponse, GetTeacherResponse } from './types/teacher-response.dto';
import { CreateTeacherDto, UpdateTeacherDto } from './types/teacher.dto';
import { TeacherFiltersOps } from './types/teacher-filters.dto';
import { AuthGuard } from '../auth/auth.guard';
import { UserDocument } from '../user/schemas/user.schema';
import { TeacherDocument } from './schemas/teacher.schema';

interface AuthenticatedRequest extends Request {
  user: UserDocument;
}

@Controller('api/v1/teachers')
@UseGuards(AuthGuard)
export class TeacherController {
  private readonly logger = new Logger(TeacherController.name);

  constructor(private readonly teacherService: TeacherService) { }

  @Post()
  async getTeachers(
    @Request() req: AuthenticatedRequest,
    @Body('filters') filters?: TeacherFiltersOps,
  ): Promise<GetTeachersResponse> {
    try {
      const schoolId = req.user?.school_id;

      if (!schoolId) {
        this.logger.warn({
          message: 'No school_id on user',
        });
        throw new BadRequestException(
          'No school id associated with the requested user',
        );
      }

      this.logger.debug({
        message: 'Received request to get teachers',
        schoolId,
        filters,
      });

      const data = await this.teacherService.findTeachersBySchoolId(
        schoolId,
        filters,
      );

      return {
        data,
        message: 'Teachers retrieved successfully',
      };
    } catch (error) {
      this.logger.error({
        error,
        message: 'Error retrieving teachers',
      });
      throw error;
    }
  }

  @Get(':id')
  async getTeacher(
    @Param('id') id: string,
  ): Promise<GetTeacherResponse> {
    try {
      this.logger.debug({
        message: 'Received request to get teacher',
        id,
      });

      const data = await this.teacherService.findTeacherById(id);

      if (!data) {
        throw new NotFoundException(`Teacher with id ${id} not found`);
      }

      return {
        data,
        message: 'Teacher retrieved successfully',
      };
    } catch (error) {
      this.logger.error({
        error,
        message: 'Error retrieving teacher',
      });
      throw error;
    }
  }

  @Post('create')
  async createTeacher(
    @Request() req: AuthenticatedRequest,
    @Body('teacher') createTeacherDto: CreateTeacherDto,
  ): Promise<{ data: TeacherDocument; message?: string }> {
    try {
      const user = req.user;

      if (!user?.school_id) {
        this.logger.warn({
          message: 'No school_id on user',
        });
        throw new BadRequestException(
          'No school id associated with the requested user',
        );
      }

      this.logger.debug({
        message: 'Received request to create teacher',
        createTeacherDto,
        userId: user._id,
      });

      const data = await this.teacherService.createTeacher(createTeacherDto, user);

      return {
        data,
        message: 'Teacher created successfully',
      };
    } catch (error) {
      this.logger.error({
        error,
        message: 'Error creating teacher',
      });
      throw error;
    }
  }

  @Put(':id')
  async updateTeacher(
    @Param('id') id: string,
    @Body('teacher') updateTeacherDto: UpdateTeacherDto,
  ): Promise<{ data: TeacherDocument; message?: string }> {
    try {
      this.logger.debug({
        message: `Received request to update teacher with id: ${id}`,
        updateTeacherDto,
      });

      const data = await this.teacherService.updateTeacher(id, updateTeacherDto);

      return {
        data,
        message: 'Teacher updated successfully',
      };
    } catch (error) {
      this.logger.error({
        error,
        message: `Error updating teacher with id: ${id}`,
      });
      throw error;
    }
  }

  @Delete(':id')
  async deleteTeacher(
    @Param('id') id: string,
  ): Promise<{ data: TeacherDocument; message?: string }> {
    try {
      this.logger.debug({
        message: `Received request to delete teacher with id: ${id}`,
      });

      const data = await this.teacherService.deleteTeacher(id);

      return {
        data,
        message: 'Teacher deleted successfully',
      };
    } catch (error) {
      this.logger.error({
        error,
        message: `Error deleting teacher with id: ${id}`,
      });
      throw error;
    }
  }
}
