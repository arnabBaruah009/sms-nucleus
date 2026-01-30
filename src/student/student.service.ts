import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Student, StudentDocument } from './schemas/student.schema';
import { UserDocument } from '../user/schemas/user.schema';
import { UserRole } from '../user/schemas/user.schema';
import { UserService } from '../user/user.service';
import { CreateStudentDto, UpdateStudentDto } from './types/student.dto';

@Injectable()
export class StudentService {
  private readonly logger = new Logger(StudentService.name);

  constructor(
    @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
    private userService: UserService,
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

  async createStudent(
    createStudentDto: CreateStudentDto,
    requestUser: UserDocument,
  ): Promise<StudentDocument> {
    try {
      this.logger.debug({
        message: 'Creating new student (user first, then student)',
        createStudentDto,
        schoolId: requestUser.school_id,
      });

      if (!requestUser.school_id) {
        throw new BadRequestException(
          'No school id associated with the requesting user',
        );
      }

      const email = createStudentDto.email?.toLowerCase();
      if (email) {
        const existingByEmail = await this.userService.findUserByEmail(email);
        if (existingByEmail) {
          throw new BadRequestException(
            'Email already exists',
          );
        }
      }
      if (createStudentDto.phone_number) {
        const existingByPhone = await this.userService.findUserByPhoneNumber(
          createStudentDto.phone_number,
        );
        if (existingByPhone) {
          throw new BadRequestException(
            'Phone number already exists',
          );
        }
      }

      const newUser = await this.userService.createUser({
        name: createStudentDto.name,
        email: createStudentDto.email,
        password: createStudentDto.password,
        phone_number: createStudentDto.phone_number,
        gender: createStudentDto.gender,
        avatar_url: createStudentDto.avatar_url,
        role: UserRole.STUDENT,
        school_id: requestUser.school_id,
      });

      const student = new this.studentModel({
        user_id: newUser._id,
        dob: new Date(createStudentDto.dob),
        address: createStudentDto.address,
        education: createStudentDto.education ?? [],
        about: createStudentDto.about,
        department: createStudentDto.department,
      });

      const savedStudent = await student.save();
      this.logger.debug({
        message: 'Student created successfully',
        studentId: savedStudent._id,
        userId: newUser._id,
      });

      const populated = await this.studentModel
        .findById(savedStudent._id)
        .populate('user_id')
        .exec();
      return populated ?? savedStudent;
    } catch (error) {
      this.logger.error({
        error,
        message: 'Error creating student',
      });
      throw error;
    }
  }

  async updateStudent(
    studentId: string,
    updateStudentDto: UpdateStudentDto,
  ): Promise<StudentDocument> {
    try {
      this.logger.debug({
        message: `Updating student with id: ${studentId} (user and/or student)`,
        updateStudentDto,
      });

      const student = await this.studentModel
        .findOne({ _id: studentId, deleted_at: null })
        .exec();

      if (!student) {
        throw new NotFoundException(`Student with id ${studentId} not found`);
      }

      const userId =
        student.user_id instanceof Types.ObjectId
          ? student.user_id.toString()
          : (student.user_id as UserDocument)._id.toString();

      const userFields = ['name', 'email', 'phone_number', 'gender', 'avatar_url'] as const;
      const userUpdateData: Partial<Record<(typeof userFields)[number], string>> = {};
      for (const key of userFields) {
        const value = updateStudentDto[key];
        if (value !== undefined) {
          userUpdateData[key] = value;
        }
      }

      if (Object.keys(userUpdateData).length > 0) {
        if (userUpdateData.email) {
          const existingByEmail = await this.userService.findUserByEmail(
            userUpdateData.email.toLowerCase(),
          );
          if (existingByEmail && existingByEmail._id.toString() !== userId) {
            throw new BadRequestException(
              'A user with this email already exists',
            );
          }
          userUpdateData.email = userUpdateData.email.toLowerCase();
        }
        if (userUpdateData.phone_number) {
          const existingByPhone = await this.userService.findUserByPhoneNumber(
            userUpdateData.phone_number,
          );
          if (existingByPhone && existingByPhone._id.toString() !== userId) {
            throw new BadRequestException(
              'A user with this phone number already exists',
            );
          }
        }
        await this.userService.updateUser(userId, userUpdateData);
      }

      const studentFields = ['dob', 'address', 'education', 'about', 'department'] as const;
      const studentUpdateData: Record<string, unknown> = {};
      for (const key of studentFields) {
        const value = updateStudentDto[key];
        if (value !== undefined) {
          studentUpdateData[key] = key === 'dob' ? new Date(value as string) : value;
        }
      }

      let updatedStudent: StudentDocument | null = null;
      if (Object.keys(studentUpdateData).length > 0) {
        updatedStudent = await this.studentModel
          .findByIdAndUpdate(studentId, studentUpdateData, { new: true })
          .exec();
      }

      const result = updatedStudent ?? student;
      const populated = await this.studentModel
        .findById(result._id)
        .populate('user_id')
        .exec();
      this.logger.debug({
        message: 'Student updated successfully',
        studentId: result._id,
      });
      return populated ?? result;
    } catch (error) {
      this.logger.error({
        error,
        message: `Error updating student with id: ${studentId}`,
      });
      throw error;
    }
  }

  async deleteStudent(studentId: string): Promise<StudentDocument> {
    try {
      this.logger.debug({
        message: `Soft deleting student with id: ${studentId}`,
      });

      const student = await this.studentModel
        .findOne({ _id: studentId, deleted_at: null })
        .exec();

      if (!student) {
        throw new NotFoundException(`Student with id ${studentId} not found`);
      }

      const updatedStudent = await this.studentModel
        .findByIdAndUpdate(
          studentId,
          { deleted_at: new Date() },
          { new: true },
        )
        .exec();

      if (!updatedStudent) {
        throw new NotFoundException(`Student with id ${studentId} not found`);
      }

      this.logger.debug({
        message: 'Student deleted successfully',
        studentId: updatedStudent._id,
      });

      return updatedStudent;
    } catch (error) {
      this.logger.error({
        error,
        message: `Error deleting student with id: ${studentId}`,
      });
      throw error;
    }
  }
}
