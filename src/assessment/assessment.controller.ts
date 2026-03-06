import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Logger,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { AssessmentService } from './assessment.service';
import {
  GetAssessmentResponse,
  SubmitAssessmentResponse,
} from './types/assessment-response.dto';
import {
  GetAssessmentParamsDto,
  SubmitAssessmentPayloadDto,
} from './types/assessment.dto';
import { AuthGuard } from '../auth/auth.guard';
import { UserDocument } from '../user/schemas/user.schema';

interface AuthenticatedRequest extends Request {
  user: UserDocument;
}

@Controller('api/v1/assessment')
@UseGuards(AuthGuard)
export class AssessmentController {
  private readonly logger = new Logger(AssessmentController.name);

  constructor(private readonly assessmentService: AssessmentService) { }

  @Get()
  async getAssessment(
    @Request() req: AuthenticatedRequest,
    @Query() params: GetAssessmentParamsDto,
  ): Promise<GetAssessmentResponse> {
    const schoolId = req.user?.school_id;

    if (!schoolId) {
      this.logger.warn({ message: 'No school_id on user' });
      throw new BadRequestException(
        'No school id associated with the requested user',
      );
    }

    this.logger.debug({
      message: 'Received request to get assessment',
      params,
      schoolId,
    });

    return this.assessmentService.getAssessment(
      String(schoolId),
      params.examId,
      params.subjectId,
      params.class,
      params.section,
    );
  }

  @Post('submit')
  async submitAssessment(
    @Request() req: AuthenticatedRequest,
    @Body() body: SubmitAssessmentPayloadDto,
  ): Promise<SubmitAssessmentResponse> {
    const schoolId = req.user?.school_id;

    if (!schoolId) {
      this.logger.warn({ message: 'No school_id on user' });
      throw new BadRequestException(
        'No school id associated with the requested user',
      );
    }

    this.logger.debug({
      message: 'Received request to submit assessment',
      examId: body.examId,
      subjectId: body.subjectId,
      schoolId,
    });

    return this.assessmentService.submitAssessment(String(schoolId), body);
  }
}
