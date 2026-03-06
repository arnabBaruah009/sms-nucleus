import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AllowList, AllowListDocument } from './schemas/allow-list.schema';
import { CreateAllowListDto } from './types/allow-list.dto';

@Injectable()
export class AllowListService {
  private logger = new Logger(AllowListService.name);

  constructor(
    @InjectModel(AllowList.name) private allowListModel: Model<AllowListDocument>,
  ) { }

  async findActiveByPhone(phone: string): Promise<AllowListDocument | null> {
    const normalized = phone.toLowerCase().trim();
    return this.allowListModel
      .findOne({ phone: normalized, deleted_at: null })
      .exec();
  }

  async findAll(): Promise<AllowListDocument[]> {
    return this.allowListModel
      .find({ deleted_at: null })
      .populate('createdBy', 'phone_number name')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findById(id: string): Promise<AllowListDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.allowListModel
      .findOne({ _id: id, deleted_at: null })
      .populate('createdBy', 'phone_number name')
      .exec();
  }

  async create(
    dto: CreateAllowListDto,
    createdByUserId: string,
  ): Promise<AllowListDocument> {
    const phone = dto.phone.toLowerCase().trim();
    const existing = await this.findActiveByPhone(phone);
    if (existing) {
      throw new BadRequestException('Phone number is already in the allow list');
    }
    const record = new this.allowListModel({
      phone,
      createdBy: new Types.ObjectId(createdByUserId),
    });
    return record.save();
  }

  async delete(id: string): Promise<AllowListDocument> {
    const record = await this.allowListModel
      .findOne({ _id: id, deleted_at: null })
      .exec();
    if (!record) {
      throw new NotFoundException(`Allow list record with id ${id} not found`);
    }
    record.deleted_at = new Date();
    return record.save();
  }
}
