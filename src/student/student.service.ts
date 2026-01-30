import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Student, StudentDocument } from './schemas/student.schema';
import { UserDocument } from '../user/schemas/user.schema';
import {
  Gender,
  EducationEntry,
} from './types/student-response.dto';

@Injectable()
export class StudentService {
  private readonly logger = new Logger(StudentService.name);

  constructor(
    @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
  ) { }

  async findStudentsBySchoolId(schoolId: string): Promise<StudentDocument[]> {
    try {
      const students = await this.studentModel
        .find({ deleted_at: null })
        .populate({
          path: 'user_id',
          match: {
            deleted_at: null,
            school_id: new Types.ObjectId(schoolId),
          },
        })
        .exec();

      return students;
    } catch (error) {
      this.logger.error({
        error,
        message: 'Error finding students by school id',
      });
      throw error;
    }
  }

  async findStudentById(
    studentId: string,
  ): Promise<StudentDocument | null> {
    try {
      const student = await this.studentModel
        .findOne({ _id: studentId, deleted_at: null })
        .populate('user_id')
        .exec();

      return student;
    } catch (error) {
      this.logger.error({
        error,
        message: 'Error finding student by id',
      });
      throw error;
    }
  }
}
