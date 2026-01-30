import {
  Controller,
  Get,
  Param,
  Logger,
  UseGuards,
  Request,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { StudentService } from './student.service';
import { GetStudentsResponse, GetStudentResponse } from './types/student-response.dto';
import { AuthGuard } from '../auth/auth.guard';
import { UserDocument } from '../user/schemas/user.schema';

interface AuthenticatedRequest extends Request {
  user: UserDocument;
}

@Controller('api/v1/students')
@UseGuards(AuthGuard)
export class StudentController {
  private readonly logger = new Logger(StudentController.name);

  constructor(private readonly studentService: StudentService) { }

  @Get()
  async getStudents(
    @Request() req: AuthenticatedRequest,
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
      });

      const data = await this.studentService.findStudentsBySchoolId(schoolId);

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
}
