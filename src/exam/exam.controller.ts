import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Logger,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { ExamService } from './exam.service';
import { GetExamsResponse } from './types/exam-response.dto';
import { CreateExamDto } from './types/exam.dto';
import { AuthGuard } from '../auth/auth.guard';
import { UserDocument } from '../user/schemas/user.schema';
import { ExamDocument } from './schemas/exam.schema';

interface AuthenticatedRequest extends Request {
  user: UserDocument;
}

@Controller('api/v1/exams')
@UseGuards(AuthGuard)
export class ExamController {
  private readonly logger = new Logger(ExamController.name);

  constructor(private readonly examService: ExamService) {}

  @Post('create')
  async createExam(
    @Request() req: AuthenticatedRequest,
    @Body('exam') createExamDto: CreateExamDto,
  ): Promise<{ data: ExamDocument; message?: string }> {
    try {
      const schoolId = req.user?.school_id;

      if (!schoolId) {
        this.logger.warn({ message: 'No school_id on user' });
        throw new BadRequestException(
          'No school id associated with the requested user',
        );
      }

      this.logger.debug({
        message: 'Received request to create exam',
        createExamDto,
        schoolId,
      });

      const data = await this.examService.createExam(schoolId, createExamDto);

      return {
        data,
        message: 'Exam created successfully',
      };
    } catch (error) {
      this.logger.error({
        error,
        message: 'Error creating exam',
      });
      throw error;
    }
  }

  @Get()
  async getExams(
    @Request() req: AuthenticatedRequest,
  ): Promise<GetExamsResponse> {
    try {
      const schoolId = req.user?.school_id;

      if (!schoolId) {
        this.logger.warn({ message: 'No school_id on user' });
        throw new BadRequestException(
          'No school id associated with the requested user',
        );
      }

      this.logger.debug({
        message: 'Received request to get exams',
        schoolId,
      });

      const data = await this.examService.findExamsBySchoolId(schoolId);

      return {
        data,
        message: 'Exams retrieved successfully',
      };
    } catch (error) {
      this.logger.error({
        error,
        message: 'Error retrieving exams',
      });
      throw error;
    }
  }

  @Delete(':id')
  async deleteExam(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<{ data: ExamDocument; message?: string }> {
    try {
      const schoolId = req.user?.school_id;

      if (!schoolId) {
        throw new BadRequestException(
          'No school id associated with the requested user',
        );
      }

      this.logger.debug({
        message: `Received request to delete exam with id: ${id}`,
      });

      const data = await this.examService.deleteExam(id, schoolId);

      return {
        data,
        message: 'Exam deleted successfully',
      };
    } catch (error) {
      this.logger.error({
        error,
        message: `Error deleting exam with id: ${id}`,
      });
      throw error;
    }
  }
}
