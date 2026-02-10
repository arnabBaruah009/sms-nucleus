import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Exam, ExamSchema } from './schemas/exam.schema';
import { ExamSubject, ExamSubjectSchema } from './schemas/exam-subject.schema';
import {
  StudentMark,
  StudentMarkSchema,
} from './schemas/student-mark.schema';
import { ExamController } from './exam.controller';
import { ExamService } from './exam.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Exam.name, schema: ExamSchema },
      { name: ExamSubject.name, schema: ExamSubjectSchema },
      { name: StudentMark.name, schema: StudentMarkSchema },
    ]),
    AuthModule,
  ],
  controllers: [ExamController],
  providers: [ExamService],
  exports: [ExamService],
})
export class ExamModule { }
