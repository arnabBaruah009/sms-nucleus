import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Exam, ExamDocument } from './schemas/exam.schema';
import { ExamSubject, ExamSubjectDocument } from './schemas/exam-subject.schema';
import { StudentMark, StudentMarkDocument } from './schemas/student-mark.schema';
import { CreateExamDto } from './types/exam.dto';

@Injectable()
export class ExamService {
  private readonly logger = new Logger(ExamService.name);

  constructor(
    @InjectModel(Exam.name) private examModel: Model<ExamDocument>,
    @InjectModel(ExamSubject.name)
    private examSubjectModel: Model<ExamSubjectDocument>,
    @InjectModel(StudentMark.name)
    private studentMarkModel: Model<StudentMarkDocument>,
  ) {}

  async createExam(
    schoolId: string,
    createExamDto: CreateExamDto,
  ): Promise<ExamDocument> {
    try {
      this.logger.debug({
        message: 'Creating new exam',
        createExamDto,
        schoolId,
      });

      const exam = new this.examModel({
        name: createExamDto.name.trim(),
        schoolId: new Types.ObjectId(schoolId),
        startDate: new Date(createExamDto.startDate),
        endDate: new Date(createExamDto.endDate),
      });

      const savedExam = await exam.save();

      if (
        createExamDto.subjects &&
        Array.isArray(createExamDto.subjects) &&
        createExamDto.subjects.length > 0
      ) {
        const examSubjects = createExamDto.subjects.map((s) => ({
          examId: savedExam._id,
          subjectId: new Types.ObjectId(s.subjectId),
          maxMarks: s.maxMark,
          passMarks: s.passMark,
        }));
        await this.examSubjectModel.insertMany(examSubjects);
      }

      this.logger.debug({
        message: 'Exam and exam subjects created successfully',
        examId: savedExam._id,
      });

      return savedExam;
    } catch (error) {
      this.logger.error({
        error,
        message: 'Error creating exam',
      });
      throw error;
    }
  }

  async findExamsBySchoolId(schoolId: string): Promise<ExamDocument[]> {
    try {
      const exams = await this.examModel
        .find({ schoolId: new Types.ObjectId(schoolId) })
        .sort({ startDate: -1 })
        .exec();

      return exams;
    } catch (error) {
      this.logger.error({
        error,
        message: 'Error finding exams by school id',
      });
      throw error;
    }
  }

  async findExamById(examId: string): Promise<ExamDocument | null> {
    try {
      const exam = await this.examModel.findById(examId).exec();
      return exam;
    } catch (error) {
      this.logger.error({
        error,
        message: 'Error finding exam by id',
      });
      throw error;
    }
  }

  async deleteExam(examId: string, schoolId: string): Promise<ExamDocument> {
    try {
      this.logger.debug({
        message: `Deleting exam with id: ${examId}`,
      });

      const exam = await this.examModel
        .findOne({
          _id: examId,
          schoolId: new Types.ObjectId(schoolId),
        })
        .exec();

      if (!exam) {
        throw new NotFoundException(`Exam with id ${examId} not found`);
      }

      await this.examSubjectModel
        .deleteMany({ examId: new Types.ObjectId(examId) })
        .exec();

      await this.studentMarkModel
        .deleteMany({ examId: new Types.ObjectId(examId) })
        .exec();

      await this.examModel.findByIdAndDelete(examId).exec();

      this.logger.debug({
        message: 'Exam and related records deleted successfully',
        examId,
      });

      return exam;
    } catch (error) {
      this.logger.error({
        error,
        message: `Error deleting exam with id: ${examId}`,
      });
      throw error;
    }
  }
}
