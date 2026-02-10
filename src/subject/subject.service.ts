import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Subject, SubjectDocument } from './schemas/subject.schema';
import { CreateSubjectDto, UpdateSubjectDto } from './types/subject.dto';

@Injectable()
export class SubjectService {
  private readonly logger = new Logger(SubjectService.name);

  constructor(
    @InjectModel(Subject.name) private subjectModel: Model<SubjectDocument>,
  ) { }

  async findSubjectsBySchoolId(schoolId: string): Promise<SubjectDocument[]> {
    try {
      const subjects = await this.subjectModel
        .find({
          schoolId: new Types.ObjectId(schoolId),
          deleted_at: null,
        })
        .sort({ name: 1 })
        .exec();

      return subjects;
    } catch (error) {
      this.logger.error({
        error,
        message: 'Error finding subjects by school id',
      });
      throw error;
    }
  }

  async findSubjectById(subjectId: string): Promise<SubjectDocument | null> {
    try {
      const subject = await this.subjectModel
        .findOne({ _id: subjectId, deleted_at: null })
        .exec();

      return subject;
    } catch (error) {
      this.logger.error({
        error,
        message: 'Error finding subject by id',
      });
      throw error;
    }
  }

  async createSubject(
    schoolId: string,
    createSubjectDto: CreateSubjectDto,
  ): Promise<SubjectDocument> {
    try {
      this.logger.debug({
        message: 'Creating new subject',
        createSubjectDto,
        schoolId,
      });

      const existing = await this.subjectModel
        .findOne({
          schoolId: new Types.ObjectId(schoolId),
          name: createSubjectDto.name.trim(),
          deleted_at: null,
        })
        .exec();

      if (existing) {
        throw new BadRequestException(
          `Subject with name "${createSubjectDto.name}" already exists for this school`,
        );
      }

      const subject = new this.subjectModel({
        schoolId: new Types.ObjectId(schoolId),
        name: createSubjectDto.name.trim(),
        code: createSubjectDto.code?.trim(),
      });

      const savedSubject = await subject.save();
      this.logger.debug({
        message: 'Subject created successfully',
        subjectId: savedSubject._id,
      });

      return savedSubject;
    } catch (error) {
      this.logger.error({
        error,
        message: 'Error creating subject',
      });
      throw error;
    }
  }

  async updateSubject(
    subjectId: string,
    schoolId: string,
    updateSubjectDto: UpdateSubjectDto,
  ): Promise<SubjectDocument> {
    try {
      this.logger.debug({
        message: `Updating subject with id: ${subjectId}`,
        updateSubjectDto,
      });

      const subject = await this.subjectModel
        .findOne({ _id: subjectId, schoolId: new Types.ObjectId(schoolId), deleted_at: null })
        .exec();

      if (!subject) {
        throw new NotFoundException(`Subject with id ${subjectId} not found`);
      }

      if (updateSubjectDto.name !== undefined) {
        const existing = await this.subjectModel
          .findOne({
            schoolId: new Types.ObjectId(schoolId),
            name: updateSubjectDto.name.trim(),
            _id: { $ne: subjectId },
            deleted_at: null,
          })
          .exec();

        if (existing) {
          throw new BadRequestException(
            `Subject with name "${updateSubjectDto.name}" already exists for this school`,
          );
        }
      }

      const updateData: Record<string, unknown> = {};
      if (updateSubjectDto.name !== undefined) {
        updateData.name = updateSubjectDto.name.trim();
      }
      if (updateSubjectDto.code !== undefined) {
        updateData.code = updateSubjectDto.code?.trim() ?? null;
      }

      const updatedSubject = await this.subjectModel
        .findByIdAndUpdate(subjectId, updateData, { new: true })
        .exec();

      if (!updatedSubject) {
        throw new NotFoundException(`Subject with id ${subjectId} not found`);
      }

      this.logger.debug({
        message: 'Subject updated successfully',
        subjectId: updatedSubject._id,
      });

      return updatedSubject;
    } catch (error) {
      this.logger.error({
        error,
        message: `Error updating subject with id: ${subjectId}`,
      });
      throw error;
    }
  }

  async deleteSubject(
    subjectId: string,
    schoolId: string,
  ): Promise<SubjectDocument> {
    try {
      this.logger.debug({
        message: `Soft deleting subject with id: ${subjectId}`,
      });

      const subject = await this.subjectModel
        .findOne({ _id: subjectId, schoolId: new Types.ObjectId(schoolId), deleted_at: null })
        .exec();

      if (!subject) {
        throw new NotFoundException(`Subject with id ${subjectId} not found`);
      }

      const updatedSubject = await this.subjectModel
        .findByIdAndUpdate(
          subjectId,
          { deleted_at: new Date() },
          { new: true },
        )
        .exec();

      if (!updatedSubject) {
        throw new NotFoundException(`Subject with id ${subjectId} not found`);
      }

      this.logger.debug({
        message: 'Subject deleted successfully',
        subjectId: updatedSubject._id,
      });

      return updatedSubject;
    } catch (error) {
      this.logger.error({
        error,
        message: `Error deleting subject with id: ${subjectId}`,
      });
      throw error;
    }
  }
}
