import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { School, SchoolDocument } from './schemas/school.schema';
import { CreateSchoolDto, UpdateSchoolDto } from './types/school.dto';
import { UserDocument } from 'src/user/schemas/user.schema';
import { UserService } from 'src/user/user.service';

@Injectable()
export class SchoolService {
  private readonly logger = new Logger(SchoolService.name);

  constructor(
    @InjectModel(School.name) private schoolModel: Model<SchoolDocument>,
    private userService: UserService,
  ) {}

  async getSchoolById(schoolId: string): Promise<SchoolDocument | null> {
    try {
      const school = await this.schoolModel
        .findOne({ _id: schoolId, deleted_at: null })
        .exec();

      if (!school) {
        this.logger.warn({
          message: `School not found with id: ${schoolId}`,
        });
        return null;
      }

      return school;
    } catch (error) {
      this.logger.error({
        error,
        message: `Error finding school by id: ${schoolId}`,
      });
      throw error;
    }
  }

  async createSchool(
    createSchoolDto: CreateSchoolDto,
    user: UserDocument,
  ): Promise<SchoolDocument> {
    try {
      this.logger.debug({
        message: 'Creating new school',
        createSchoolDto,
      });

      // Check if school with same email already exists
      const existingSchool = await this.schoolModel
        .findOne({
          email: createSchoolDto.email.toLowerCase(),
          deleted_at: null,
        })
        .exec();

      if (existingSchool) {
        throw new BadRequestException(
          'School with this email already exists',
        );
      }

      const school = new this.schoolModel({
        ...createSchoolDto,
        email: createSchoolDto.email.toLowerCase(),
      });

      const savedSchool = await school.save();
      this.logger.debug({
        message: 'School created successfully',
        schoolId: savedSchool._id,
      });

      await this.userService.updateUser(user._id.toString(), { school_id: savedSchool._id.toString() });

      return savedSchool;
    } catch (error) {
      this.logger.error({
        error,
        message: 'Error creating school',
      });
      throw error;
    }
  }

  async updateSchool(
    schoolId: string,
    updateSchoolDto: UpdateSchoolDto,
  ): Promise<SchoolDocument> {
    try {
      this.logger.debug({
        message: `Updating school with id: ${schoolId}`,
        updateSchoolDto,
      });

      const school = await this.schoolModel
        .findOne({ _id: schoolId, deleted_at: null })
        .exec();

      if (!school) {
        throw new NotFoundException(`School with id ${schoolId} not found`);
      }

      // If email is being updated, check if it's already taken
      if (updateSchoolDto.email) {
        const existingSchool = await this.schoolModel
          .findOne({
            email: updateSchoolDto.email.toLowerCase(),
            _id: { $ne: schoolId },
            deleted_at: null,
          })
          .exec();

        if (existingSchool) {
          throw new BadRequestException(
            'School with this email already exists',
          );
        }
      }

      // Prepare update data
      const updateData: any = { ...updateSchoolDto };
      if (updateData.email) {
        updateData.email = updateData.email.toLowerCase();
      }

      const updatedSchool = await this.schoolModel
        .findByIdAndUpdate(schoolId, updateData, { new: true })
        .exec();

      if (!updatedSchool) {
        throw new NotFoundException(`School with id ${schoolId} not found`);
      }

      this.logger.debug({
        message: 'School updated successfully',
        schoolId: updatedSchool._id,
      });

      return updatedSchool;
    } catch (error) {
      this.logger.error({
        error,
        message: `Error updating school with id: ${schoolId}`,
      });
      throw error;
    }
  }
}
