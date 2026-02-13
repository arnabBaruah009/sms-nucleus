import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Exam, ExamSchema } from '../exam/schemas/exam.schema';
import {
  ExamSubject,
  ExamSubjectSchema,
} from '../exam/schemas/exam-subject.schema';
import {
  StudentMark,
  StudentMarkSchema,
} from '../exam/schemas/student-mark.schema';
import { AssessmentController } from './assessment.controller';
import { AssessmentService } from './assessment.service';
import { AuthModule } from '../auth/auth.module';
import { StudentModule } from '../student/student.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Exam.name, schema: ExamSchema },
      { name: ExamSubject.name, schema: ExamSubjectSchema },
      { name: StudentMark.name, schema: StudentMarkSchema },
    ]),
    AuthModule,
    StudentModule,
  ],
  controllers: [AssessmentController],
  providers: [AssessmentService],
  exports: [AssessmentService],
})
export class AssessmentModule { }
