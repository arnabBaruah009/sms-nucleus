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
import { StudentService } from './student.service';
import { GetStudentsResponse, GetStudentResponse } from './types/student-response.dto';
import {
  CreateStudentDto,
  UpdateStudentDto,
} from './types/student.dto';
import { StudentFiltersOps } from './types/student-filters.dto';
import { AuthGuard } from '../auth/auth.guard';
import { UserDocument } from '../user/schemas/user.schema';
import { StudentDocument } from './schemas/student.schema';

interface AuthenticatedRequest extends Request {
  user: UserDocument;
}

@Controller('api/v1/students')
@UseGuards(AuthGuard)
export class StudentController {
  private readonly logger = new Logger(StudentController.name);

  constructor(private readonly studentService: StudentService) { }

  @Post()
  async getStudents(
    @Request() req: AuthenticatedRequest,
    @Body('filters') filters?: StudentFiltersOps,
  ): Promise<GetStudentsResponse> {
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
        message: 'Received request to get students',
        schoolId,
        filters,
      });

      const data = await this.studentService.findStudentsBySchoolId(
        schoolId,
        filters,
      );

      return {
        data,
        message: 'Students retrieved successfully',
      };
    } catch (error) {
      this.logger.error({
        error,
        message: 'Error retrieving students',
      });
      throw error;
    }
  }

  @Get(':id')
  async getStudent(
    @Param('id') id: string,
  ): Promise<GetStudentResponse> {
    try {
      this.logger.debug({
        message: 'Received request to get student',
        id,
      });

      const data = await this.studentService.findStudentById(id);

      if (!data) {
        throw new NotFoundException(`Student with id ${id} not found`);
      }

      return {
        data,
        message: 'Student retrieved successfully',
      };
    } catch (error) {
      this.logger.error({
        error,
        message: 'Error retrieving student',
      });
      throw error;
    }
  }

  @Post()
  async createStudent(
    @Request() req: AuthenticatedRequest,
    @Body('student') createStudentDto: CreateStudentDto,
  ): Promise<{ data: StudentDocument; message?: string }> {
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
        message: 'Received request to create student',
        createStudentDto,
        userId: user._id,
      });

      const data = await this.studentService.createStudent(createStudentDto, user);

      return {
        data,
        message: 'Student created successfully',
      };
    } catch (error) {
      this.logger.error({
        error,
        message: 'Error creating student',
      });
      throw error;
    }
  }

  @Put(':id')
  async updateStudent(
    @Param('id') id: string,
    @Body('student') updateStudentDto: UpdateStudentDto,
  ): Promise<{ data: StudentDocument; message?: string }> {
    try {
      this.logger.debug({
        message: `Received request to update student with id: ${id}`,
        updateStudentDto,
      });

      const data = await this.studentService.updateStudent(id, updateStudentDto);

      return {
        data,
        message: 'Student updated successfully',
      };
    } catch (error) {
      this.logger.error({
        error,
        message: `Error updating student with id: ${id}`,
      });
      throw error;
    }
  }

  @Delete(':id')
  async deleteStudent(
    @Param('id') id: string,
  ): Promise<{ data: StudentDocument; message?: string }> {
    try {
      this.logger.debug({
        message: `Received request to delete student with id: ${id}`,
      });

      const data = await this.studentService.deleteStudent(id);

      return {
        data,
        message: 'Student deleted successfully',
      };
    } catch (error) {
      this.logger.error({
        error,
        message: `Error deleting student with id: ${id}`,
      });
      throw error;
    }
  }
}
