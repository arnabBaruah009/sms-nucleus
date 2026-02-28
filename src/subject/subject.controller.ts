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
import { SubjectService } from './subject.service';
import {
  GetSubjectsResponse,
  GetSubjectResponse,
} from './types/subject-response.dto';
import { CreateSubjectDto, UpdateSubjectDto } from './types/subject.dto';
import { AuthGuard } from '../auth/auth.guard';
import { UserDocument } from '../user/schemas/user.schema';
import { SubjectDocument } from './schemas/subject.schema';

interface AuthenticatedRequest extends Request {
  user: UserDocument;
}

@Controller('api/v1/subjects')
@UseGuards(AuthGuard)
export class SubjectController {
  private readonly logger = new Logger(SubjectController.name);

  constructor(private readonly subjectService: SubjectService) { }

  @Get()
  async getSubjects(
    @Request() req: AuthenticatedRequest,
  ): Promise<GetSubjectsResponse> {
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
        message: 'Received request to get subjects',
        schoolId,
      });

      const data = await this.subjectService.findSubjectsBySchoolId(schoolId);

      return {
        data,
        message: 'Subjects retrieved successfully',
      };
    } catch (error) {
      this.logger.error({
        error,
        message: 'Error retrieving subjects',
      });
      throw error;
    }
  }

  @Get(':id')
  async getSubject(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<GetSubjectResponse> {
    try {
      const schoolId = req.user?.school_id;

      if (!schoolId) {
        throw new BadRequestException(
          'No school id associated with the requested user',
        );
      }

      this.logger.debug({
        message: 'Received request to get subject',
        id,
      });

      const data = await this.subjectService.findSubjectById(id);

      if (!data) {
        throw new NotFoundException(`Subject with id ${id} not found`);
      }

      if (data.schoolId.toString() !== schoolId) {
        throw new NotFoundException(`Subject with id ${id} not found`);
      }

      return {
        data,
        message: 'Subject retrieved successfully',
      };
    } catch (error) {
      this.logger.error({
        error,
        message: 'Error retrieving subject',
      });
      throw error;
    }
  }

  @Post('create')
  async createSubject(
    @Request() req: AuthenticatedRequest,
    @Body('subject') createSubjectDto: CreateSubjectDto,
  ): Promise<{ data: SubjectDocument; message?: string }> {
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
        message: 'Received request to create subject',
        createSubjectDto,
        schoolId,
      });

      const data = await this.subjectService.createSubject(
        schoolId,
        createSubjectDto,
      );

      return {
        data,
        message: 'Subject created successfully',
      };
    } catch (error) {
      this.logger.error({
        error,
        message: 'Error creating subject',
      });
      throw error;
    }
  }

  @Put(':id')
  async updateSubject(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
    @Body('subject') updateSubjectDto: UpdateSubjectDto,
  ): Promise<{ data: SubjectDocument; message?: string }> {
    try {
      const schoolId = req.user?.school_id;

      if (!schoolId) {
        throw new BadRequestException(
          'No school id associated with the requested user',
        );
      }

      this.logger.debug({
        message: `Received request to update subject with id: ${id}`,
        updateSubjectDto,
      });

      const data = await this.subjectService.updateSubject(
        id,
        schoolId,
        updateSubjectDto,
      );

      return {
        data,
        message: 'Subject updated successfully',
      };
    } catch (error) {
      this.logger.error({
        error,
        message: `Error updating subject with id: ${id}`,
      });
      throw error;
    }
  }

  @Delete(':id')
  async deleteSubject(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<{ data: SubjectDocument; message?: string }> {
    try {
      const schoolId = req.user?.school_id;

      if (!schoolId) {
        throw new BadRequestException(
          'No school id associated with the requested user',
        );
      }

      this.logger.debug({
        message: `Received request to delete subject with id: ${id}`,
      });

      const data = await this.subjectService.deleteSubject(id, schoolId);

      return {
        data,
        message: 'Subject deleted successfully',
      };
    } catch (error) {
      this.logger.error({
        error,
        message: `Error deleting subject with id: ${id}`,
      });
      throw error;
    }
  }
}
