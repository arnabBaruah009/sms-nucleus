import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Exam, ExamDocument } from '../exam/schemas/exam.schema';
import {
  ExamSubject,
  ExamSubjectDocument,
} from '../exam/schemas/exam-subject.schema';
import {
  StudentMark,
  StudentMarkDocument,
} from '../exam/schemas/student-mark.schema';
import { StudentDocument } from '../student/schemas/student.schema';
import { UserDocument } from '../user/schemas/user.schema';
import { StudentService } from '../student/student.service';
import {
  GetAssessmentResponse,
  AssessmentStudent,
  SubmitAssessmentResponse,
} from './types/assessment-response.dto';
import { SubmitAssessmentPayloadDto } from './types/assessment.dto';

@Injectable()
export class AssessmentService {
  private readonly logger = new Logger(AssessmentService.name);

  constructor(
    @InjectModel(Exam.name) private examModel: Model<ExamDocument>,
    @InjectModel(ExamSubject.name)
    private examSubjectModel: Model<ExamSubjectDocument>,
    @InjectModel(StudentMark.name)
    private studentMarkModel: Model<StudentMarkDocument>,
    private studentService: StudentService,
  ) { }

  async getAssessment(
    schoolId: string,
    examId: string,
    subjectId: string,
    classParam: string,
    section: string,
  ): Promise<GetAssessmentResponse> {
    const exam = await this.examModel
      .findOne({
        _id: new Types.ObjectId(examId),
        schoolId: new Types.ObjectId(schoolId),
      })
      .exec();

    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    const examSubject = await this.examSubjectModel
      .findOne({
        examId: new Types.ObjectId(examId),
        subjectId: new Types.ObjectId(subjectId),
      })
      .exec();

    if (!examSubject) {
      throw new NotFoundException('Exam subject not found');
    }

    const students =
      await this.studentService.findStudentsBySchoolId(
        schoolId,
        { class: classParam, section },
      );

    const assessmentStudents: AssessmentStudent[] = students.map((s) =>
      this.mapStudentToAssessmentStudent(s),
    );

    return {
      students: assessmentStudents,
      passMark: examSubject.passMarks,
      maxMark: examSubject.maxMarks,
    };
  }

  async submitAssessment(
    schoolId: string,
    payload: SubmitAssessmentPayloadDto,
  ): Promise<SubmitAssessmentResponse> {
    const exam = await this.examModel
      .findOne({
        _id: new Types.ObjectId(payload.examId),
        schoolId: new Types.ObjectId(schoolId),
      })
      .exec();

    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    const examSubject = await this.examSubjectModel
      .findOne({
        examId: new Types.ObjectId(payload.examId),
        subjectId: new Types.ObjectId(payload.subjectId),
      })
      .exec();

    if (!examSubject) {
      throw new NotFoundException('Exam subject not found');
    }

    const examSubjectId = examSubject._id;

    for (const entry of payload.assessment) {
      await this.studentMarkModel
        .findOneAndUpdate(
          {
            studentId: new Types.ObjectId(entry.studentId),
            examId: new Types.ObjectId(payload.examId),
            subjectId: examSubjectId,
          },
          {
            $set: {
              marksObtained: entry.marksObtained,
              remarks: entry.remarks ?? '',
            },
          },
          { upsert: true, new: true },
        )
        .exec();
    }

    this.logger.debug({
      message: 'Assessment submitted successfully',
      examId: payload.examId,
      subjectId: payload.subjectId,
      entriesCount: payload.assessment.length,
    });

    return { message: 'Assessment submitted successfully' };
  }

  private mapStudentToAssessmentStudent(
    student: StudentDocument,
  ): AssessmentStudent {
    const user = student.user_id as unknown as UserDocument | undefined;
    return {
      _id: String(student._id),
      name: user?.name ?? '',
      rollNumber: student.rollNumber,
    };
  }
}
