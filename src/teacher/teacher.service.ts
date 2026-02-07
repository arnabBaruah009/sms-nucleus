import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Teacher, TeacherDocument } from './schemas/teacher.schema';
import { UserDocument, UserRole } from '../user/schemas/user.schema';
import { UserService } from '../user/user.service';
import { CreateTeacherDto, UpdateTeacherDto } from './types/teacher.dto';
import { TeacherFiltersOps } from './types/teacher-filters.dto';

@Injectable()
export class TeacherService {
  private readonly logger = new Logger(TeacherService.name);

  constructor(
    @InjectModel(Teacher.name) private teacherModel: Model<TeacherDocument>,
    private userService: UserService,
  ) { }

  async findTeachersBySchoolId(
    schoolId: string,
    filters?: TeacherFiltersOps,
  ): Promise<TeacherDocument[]> {
    try {
      const trimmedQuery = filters?.searchQuery?.trim();
      const safeQuery = trimmedQuery
        ? trimmedQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        : undefined;

      const userMatch: Record<string, unknown> = {
        deleted_at: null,
        school_id: new Types.ObjectId(schoolId),
        ...(filters?.gender && { gender: filters.gender }),
        ...(safeQuery && {
          $or: [
            { name: { $regex: safeQuery, $options: 'i' } },
            { phone_number: { $regex: safeQuery, $options: 'i' } },
            { email: { $regex: safeQuery, $options: 'i' } },
          ],
        }),
      };

      const teachers = await this.teacherModel
        .find({ deleted_at: null })
        .populate({
          path: 'user_id',
          match: userMatch,
        })
        .exec();

      return teachers.filter((teacher) => teacher.user_id);
    } catch (error) {
      this.logger.error({
        error,
        message: 'Error finding teachers by school id',
      });
      throw error;
    }
  }

  async findTeacherById(
    teacherId: string,
  ): Promise<TeacherDocument | null> {
    try {
      const teacher = await this.teacherModel
        .findOne({ _id: teacherId, deleted_at: null })
        .populate('user_id')
        .exec();

      return teacher;
    } catch (error) {
      this.logger.error({
        error,
        message: 'Error finding teacher by id',
      });
      throw error;
    }
  }

  async createTeacher(
    createTeacherDto: CreateTeacherDto,
    requestUser: UserDocument,
  ): Promise<TeacherDocument> {
    try {
      this.logger.debug({
        message: 'Creating new teacher (user first, then teacher)',
        createTeacherDto,
        schoolId: requestUser.school_id,
      });

      if (!requestUser.school_id) {
        throw new BadRequestException(
          'No school id associated with the requesting user',
        );
      }

      const email = createTeacherDto.email?.toLowerCase();
      if (email) {
        const existingByEmail = await this.userService.findUserByEmail(email);
        if (existingByEmail) {
          throw new BadRequestException(
            'Email already exists',
          );
        }
      }
      if (createTeacherDto.phone_number) {
        const existingByPhone = await this.userService.findUserByPhoneNumber(
          createTeacherDto.phone_number,
        );
        if (existingByPhone) {
          throw new BadRequestException(
            'Phone number already exists',
          );
        }
      }

      const newUser = await this.userService.createUser({
        name: createTeacherDto.name,
        email: createTeacherDto.email,
        password: createTeacherDto.password,
        phone_number: createTeacherDto.phone_number,
        gender: createTeacherDto.gender,
        avatar_url: createTeacherDto.avatar_url,
        role: UserRole.TEACHER,
        school_id: requestUser.school_id,
      });

      const teacher = new this.teacherModel({
        user_id: newUser._id,
        dob: new Date(createTeacherDto.dob),
        address: createTeacherDto.address,
        education: createTeacherDto.education ?? [],
        subjects: createTeacherDto.subjects ?? [],
      });

      const savedTeacher = await teacher.save();
      this.logger.debug({
        message: 'Teacher created successfully',
        teacherId: savedTeacher._id,
        userId: newUser._id,
      });

      const populated = await this.teacherModel
        .findById(savedTeacher._id)
        .populate('user_id')
        .exec();
      return populated ?? savedTeacher;
    } catch (error) {
      this.logger.error({
        error,
        message: 'Error creating teacher',
      });
      throw error;
    }
  }

  async updateTeacher(
    teacherId: string,
    updateTeacherDto: UpdateTeacherDto,
  ): Promise<TeacherDocument> {
    try {
      this.logger.debug({
        message: `Updating teacher with id: ${teacherId} (user and/or teacher)`,
        updateTeacherDto,
      });

      const teacher = await this.teacherModel
        .findOne({ _id: teacherId, deleted_at: null })
        .exec();

      if (!teacher) {
        throw new NotFoundException(`Teacher with id ${teacherId} not found`);
      }

      const userId =
        teacher.user_id instanceof Types.ObjectId
          ? teacher.user_id.toString()
          : (teacher.user_id as UserDocument)._id.toString();

      const userFields = ['name', 'email', 'phone_number', 'gender', 'avatar_url'] as const;
      const userUpdateData: Partial<Record<(typeof userFields)[number], string>> = {};
      for (const key of userFields) {
        const value = updateTeacherDto[key];
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

      const teacherFields = ['dob', 'address', 'education', 'subjects'] as const;
      const teacherUpdateData: Record<string, unknown> = {};
      for (const key of teacherFields) {
        const value = updateTeacherDto[key];
        if (value !== undefined) {
          teacherUpdateData[key] = key === 'dob' ? new Date(value as string) : value;
        }
      }

      let updatedTeacher: TeacherDocument | null = null;
      if (Object.keys(teacherUpdateData).length > 0) {
        updatedTeacher = await this.teacherModel
          .findByIdAndUpdate(teacherId, teacherUpdateData, { new: true })
          .exec();
      }

      const result = updatedTeacher ?? teacher;
      const populated = await this.teacherModel
        .findById(result._id)
        .populate('user_id')
        .exec();
      this.logger.debug({
        message: 'Teacher updated successfully',
        teacherId: result._id,
      });
      return populated ?? result;
    } catch (error) {
      this.logger.error({
        error,
        message: `Error updating teacher with id: ${teacherId}`,
      });
      throw error;
    }
  }

  async deleteTeacher(teacherId: string): Promise<TeacherDocument> {
    try {
      this.logger.debug({
        message: `Soft deleting teacher with id: ${teacherId}`,
      });

      const teacher = await this.teacherModel
        .findOne({ _id: teacherId, deleted_at: null })
        .exec();

      if (!teacher) {
        throw new NotFoundException(`Teacher with id ${teacherId} not found`);
      }

      const updatedTeacher = await this.teacherModel
        .findByIdAndUpdate(
          teacherId,
          { deleted_at: new Date() },
          { new: true },
        )
        .exec();

      if (!updatedTeacher) {
        throw new NotFoundException(`Teacher with id ${teacherId} not found`);
      }

      this.logger.debug({
        message: 'Teacher deleted successfully',
        teacherId: updatedTeacher._id,
      });

      return updatedTeacher;
    } catch (error) {
      this.logger.error({
        error,
        message: `Error deleting teacher with id: ${teacherId}`,
      });
      throw error;
    }
  }
}
