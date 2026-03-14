import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  FinanceStructure,
  FinanceStructureDocument,
} from './schemas/finance-structure.schema';
import {
  FinanceInvoice,
  FinanceInvoiceDocument,
} from './schemas/finance-invoice.schema';
import {
  FinanceEntry,
  FinanceEntryDocument,
} from './schemas/finance-entry.schema';
import {
  CreateFinanceStructureDto,
  UpdateFinanceStructureDto,
} from './types/finance-structure.dto';
import {
  CreateFinanceInvoiceDto,
  UpdateFinanceInvoiceDto,
} from './types/finance-invoice.dto';
import { CreateFinanceEntryDto } from './types/finance-entry.dto';
import {
  GetStructuresQueryDto,
  GetInvoicesQueryDto,
  GetEntriesQueryDto,
} from './types/finance-query.dto';
import {
  FinanceInvoiceStatus,
  FinanceEntityType,
  FinanceEntryType,
} from './finance.enums';
import {
  LedgerEntryDto,
  EntityDetailsDto,
  FinanceInvoiceWithEntityDto,
} from './types/finance-response.dto';
import { Student, StudentDocument } from '../student/schemas/student.schema';
import { Teacher, TeacherDocument } from '../teacher/schemas/teacher.schema';
import { User, UserDocument } from '../user/schemas/user.schema';
import { School, SchoolDocument } from '../school/schemas/school.schema';

@Injectable()
export class FinanceService {
  private readonly logger = new Logger(FinanceService.name);

  constructor(
    @InjectModel(FinanceStructure.name)
    private structureModel: Model<FinanceStructureDocument>,
    @InjectModel(FinanceInvoice.name)
    private invoiceModel: Model<FinanceInvoiceDocument>,
    @InjectModel(FinanceEntry.name)
    private entryModel: Model<FinanceEntryDocument>,
    @InjectModel(Student.name)
    private studentModel: Model<StudentDocument>,
    @InjectModel(Teacher.name)
    private teacherModel: Model<TeacherDocument>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    @InjectModel(School.name)
    private schoolModel: Model<SchoolDocument>,
  ) { }

  private async getEntityDetails(
    entityType: FinanceEntityType,
    entityId?: Types.ObjectId | null,
  ): Promise<EntityDetailsDto | null> {
    if (!entityId) return null;
    try {
      const id = entityId.toString();
      switch (entityType) {
        case FinanceEntityType.STUDENT: {
          const student = await this.studentModel
            .findById(entityId)
            .populate<{ user_id: UserDocument }>('user_id', 'name email phone_number')
            .exec();
          if (!student) return null;
          const user = student.user_id as unknown as UserDocument;
          return {
            id,
            type: entityType,
            name: user?.name,
            email: user?.email,
            phone_number: user?.phone_number,
            rollNumber: student.rollNumber,
            class: student.class,
            section: student.section,
          };
        }
        case FinanceEntityType.TEACHER: {
          const teacher = await this.teacherModel
            .findById(entityId)
            .populate<{ user_id: UserDocument }>('user_id', 'name email phone_number')
            .exec();
          if (!teacher) return null;
          const user = teacher.user_id as unknown as UserDocument;
          return {
            id,
            type: entityType,
            name: user?.name,
            email: user?.email,
            phone_number: user?.phone_number,
            subjects: teacher.subjects,
          };
        }
        case FinanceEntityType.USER: {
          const user = await this.userModel.findById(entityId).exec();
          if (!user) return null;
          return {
            id,
            type: entityType,
            name: user.name,
            email: user.email,
            phone_number: user.phone_number,
          };
        }
        case FinanceEntityType.SCHOOL: {
          const school = await this.schoolModel.findById(entityId).exec();
          if (!school) return null;
          return {
            id,
            type: entityType,
            name: school.name,
            email: school.email,
            phone_number: school.phone_number,
          };
        }
        case FinanceEntityType.VENDOR:
        case FinanceEntityType.OTHER:
        default:
          return { id, type: entityType };
      }
    } catch (error) {
      this.logger.warn({
        error,
        message: 'Error fetching entity details',
        entityType,
        entityId: entityId.toString(),
      });
      return null;
    }
  }

  private static computeStatus(
    paidAmount: number,
    totalAmount: number,
    currentStatus: FinanceInvoiceStatus,
  ): FinanceInvoiceStatus {
    if (currentStatus === FinanceInvoiceStatus.CANCELLED) {
      return FinanceInvoiceStatus.CANCELLED;
    }
    const dueAmount = Math.max(0, totalAmount - paidAmount);
    if (dueAmount <= 0) return FinanceInvoiceStatus.PAID;
    if (paidAmount > 0) return FinanceInvoiceStatus.PARTIAL;
    return FinanceInvoiceStatus.PENDING;
  }

  private async generateInvoiceNumber(schoolId: Types.ObjectId): Promise<string> {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const count = await this.invoiceModel
      .countDocuments({
        schoolId,
        createdAt: { $gte: today },
      })
      .exec();
    const seq = String(count + 1).padStart(4, '0');
    const yyyy = today.getUTCFullYear();
    const mm = String(today.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(today.getUTCDate()).padStart(2, '0');
    return `FIN-${yyyy}${mm}${dd}-${seq}`;
  }

  // ---------- Structures ----------
  async createStructure(
    schoolId: string,
    dto: CreateFinanceStructureDto,
  ): Promise<FinanceStructureDocument> {
    try {
      const doc = new this.structureModel({
        schoolId: new Types.ObjectId(schoolId),
        name: dto.name.trim(),
        description: dto.description?.trim(),
        amount: dto.amount,
        frequency: dto.frequency,
        applicableTo: dto.applicableTo,
        classId: dto.classId ? new Types.ObjectId(dto.classId) : null,
        isActive: dto.isActive ?? true,
      });
      return await doc.save();
    } catch (error) {
      this.logger.error({ error, message: 'Error creating finance structure' });
      throw error;
    }
  }

  async findStructures(
    schoolId: string,
    query: GetStructuresQueryDto,
  ): Promise<FinanceStructureDocument[]> {
    try {
      const filter: Record<string, unknown> = {
        schoolId: new Types.ObjectId(schoolId),
      };
      if (query.applicableTo) filter.applicableTo = query.applicableTo;
      if (query.classId) filter.classId = new Types.ObjectId(query.classId);

      return await this.structureModel
        .find(filter)
        .skip(query.offset ?? 0)
        .limit(query.limit ?? 50)
        .sort({ createdAt: -1 })
        .exec();
    } catch (error) {
      this.logger.error({ error, message: 'Error finding finance structures' });
      throw error;
    }
  }

  async findStructureById(
    id: string,
    schoolId: string,
  ): Promise<FinanceStructureDocument | null> {
    try {
      return await this.structureModel
        .findOne({
          _id: new Types.ObjectId(id),
          schoolId: new Types.ObjectId(schoolId),
        })
        .exec();
    } catch (error) {
      this.logger.error({ error, message: 'Error finding finance structure by id' });
      throw error;
    }
  }

  async updateStructure(
    id: string,
    schoolId: string,
    dto: UpdateFinanceStructureDto,
  ): Promise<FinanceStructureDocument> {
    try {
      const structure = await this.findStructureById(id, schoolId);
      if (!structure) {
        throw new NotFoundException(`Finance structure with id ${id} not found`);
      }
      const update: Record<string, unknown> = { updatedAt: new Date() };
      if (dto.name !== undefined) update.name = dto.name.trim();
      if (dto.description !== undefined) update.description = dto.description?.trim();
      if (dto.amount !== undefined) update.amount = dto.amount;
      if (dto.frequency !== undefined) update.frequency = dto.frequency;
      if (dto.applicableTo !== undefined) update.applicableTo = dto.applicableTo;
      if (dto.classId !== undefined) {
        update.classId = dto.classId ? new Types.ObjectId(dto.classId) : null;
      }
      if (dto.isActive !== undefined) update.isActive = dto.isActive;

      const updated = await this.structureModel
        .findByIdAndUpdate(id, { $set: update }, { new: true })
        .exec();
      if (!updated) {
        throw new NotFoundException(`Finance structure with id ${id} not found`);
      }
      return updated;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error({ error, message: 'Error updating finance structure' });
      throw error;
    }
  }

  async deleteStructure(
    id: string,
    schoolId: string,
  ): Promise<FinanceStructureDocument> {
    try {
      const structure = await this.findStructureById(id, schoolId);
      if (!structure) {
        throw new NotFoundException(`Finance structure with id ${id} not found`);
      }
      await this.structureModel.findByIdAndDelete(id).exec();
      return structure;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error({ error, message: 'Error deleting finance structure' });
      throw error;
    }
  }

  // ---------- Invoices ----------
  async createInvoice(
    schoolId: string,
    dto: CreateFinanceInvoiceDto,
  ): Promise<FinanceInvoiceDocument> {
    try {
      const paidAmount = Math.min(dto.paidAmount ?? 0, dto.totalAmount);
      const dueAmount = Math.max(0, dto.totalAmount - paidAmount);
      const status =
        dto.status ??
        FinanceService.computeStatus(paidAmount, dto.totalAmount, FinanceInvoiceStatus.PENDING);

      const invoiceNumber = await this.generateInvoiceNumber(new Types.ObjectId(schoolId));

      const doc = new this.invoiceModel({
        schoolId: new Types.ObjectId(schoolId),
        invoiceNumber,
        invoiceType: dto.invoiceType,
        entityType: dto.entityType,
        entityId: new Types.ObjectId(dto.entityId),
        structureId: dto.structureId ? new Types.ObjectId(dto.structureId) : null,
        title: dto.title.trim(),
        description: dto.description?.trim(),
        totalAmount: dto.totalAmount,
        paidAmount,
        dueAmount,
        status,
        issueDate: new Date(dto.issueDate),
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        meta: dto.meta ?? {},
      });
      return await doc.save();
    } catch (error) {
      this.logger.error({ error, message: 'Error creating finance invoice' });
      throw error;
    }
  }

  private async enrichInvoiceWithEntity(
    invoice: FinanceInvoiceDocument,
  ): Promise<FinanceInvoiceWithEntityDto> {
    const entity = await this.getEntityDetails(
      invoice.entityType,
      invoice.entityId,
    );
    return {
      ...invoice.toObject(),
      entity: entity ?? null,
    } as FinanceInvoiceWithEntityDto;
  }

  async findInvoices(
    schoolId: string,
    query: GetInvoicesQueryDto,
  ): Promise<FinanceInvoiceWithEntityDto[]> {
    try {
      const filter: Record<string, unknown> = {
        schoolId: new Types.ObjectId(schoolId),
      };
      if (query.status) filter.status = query.status;
      if (query.entityType) filter.entityType = query.entityType;
      if (query.entityId) filter.entityId = new Types.ObjectId(query.entityId);

      const invoices = await this.invoiceModel
        .find(filter)
        .skip(query.offset ?? 0)
        .limit(query.limit ?? 50)
        .sort({ createdAt: -1 })
        .exec();

      return Promise.all(
        invoices.map((inv) => this.enrichInvoiceWithEntity(inv)),
      );
    } catch (error) {
      this.logger.error({ error, message: 'Error finding finance invoices' });
      throw error;
    }
  }

  async findInvoiceById(
    id: string,
    schoolId: string,
  ): Promise<FinanceInvoiceWithEntityDto | null> {
    try {
      const invoice = await this.invoiceModel
        .findOne({
          _id: new Types.ObjectId(id),
          schoolId: new Types.ObjectId(schoolId),
        })
        .exec();
      if (!invoice) return null;
      return this.enrichInvoiceWithEntity(invoice);
    } catch (error) {
      this.logger.error({ error, message: 'Error finding finance invoice by id' });
      throw error;
    }
  }

  async updateInvoice(
    id: string,
    schoolId: string,
    dto: UpdateFinanceInvoiceDto,
  ): Promise<FinanceInvoiceDocument> {
    try {
      const invoice = await this.findInvoiceById(id, schoolId);
      if (!invoice) {
        throw new NotFoundException(`Finance invoice with id ${id} not found`);
      }

      const totalAmount = dto.totalAmount ?? invoice.totalAmount;
      const paidAmount = invoice.paidAmount;
      if (paidAmount > totalAmount) {
        throw new BadRequestException('paidAmount cannot exceed totalAmount');
      }
      const dueAmount = Math.max(0, totalAmount - paidAmount);
      const status = FinanceService.computeStatus(
        paidAmount,
        totalAmount,
        dto.status ?? invoice.status,
      );

      const update: Record<string, unknown> = {
        totalAmount,
        paidAmount,
        dueAmount,
        status,
        updatedAt: new Date(),
      };
      if (dto.invoiceType !== undefined) update.invoiceType = dto.invoiceType;
      if (dto.entityType !== undefined) update.entityType = dto.entityType;
      if (dto.entityId !== undefined) update.entityId = new Types.ObjectId(dto.entityId);
      if (dto.structureId !== undefined) {
        update.structureId = dto.structureId ? new Types.ObjectId(dto.structureId) : null;
      }
      if (dto.title !== undefined) update.title = dto.title.trim();
      if (dto.description !== undefined) update.description = dto.description?.trim();
      if (dto.issueDate !== undefined) update.issueDate = new Date(dto.issueDate);
      if (dto.dueDate !== undefined) update.dueDate = new Date(dto.dueDate);
      if (dto.meta !== undefined) update.meta = dto.meta;
      if (dto.status !== undefined) update.status = dto.status;

      const updated = await this.invoiceModel
        .findByIdAndUpdate(id, { $set: update }, { new: true })
        .exec();
      if (!updated) {
        throw new NotFoundException(`Finance invoice with id ${id} not found`);
      }
      return updated;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error({ error, message: 'Error updating finance invoice' });
      throw error;
    }
  }

  async deleteInvoice(
    id: string,
    schoolId: string,
  ): Promise<FinanceInvoiceDocument> {
    try {
      const invoice = await this.findInvoiceById(id, schoolId);
      if (!invoice) {
        throw new NotFoundException(`Finance invoice with id ${id} not found`);
      }
      await this.invoiceModel.findByIdAndDelete(id).exec();
      return invoice;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error({ error, message: 'Error deleting finance invoice' });
      throw error;
    }
  }

  async findInvoicesByEntity(
    schoolId: string,
    entityType: FinanceEntityType,
    entityId: string,
  ): Promise<FinanceInvoiceWithEntityDto[]> {
    try {
      const invoices = await this.invoiceModel
        .find({
          schoolId: new Types.ObjectId(schoolId),
          entityType,
          entityId: new Types.ObjectId(entityId),
        })
        .sort({ createdAt: -1 })
        .exec();
      return Promise.all(
        invoices.map((inv) => this.enrichInvoiceWithEntity(inv)),
      );
    } catch (error) {
      this.logger.error({
        error,
        message: 'Error finding finance invoices by entity',
      });
      throw error;
    }
  }

  async findOutstandingInvoices(
    schoolId: string,
    entityType?: FinanceEntityType,
    entityId?: string,
  ): Promise<FinanceInvoiceDocument[]> {
    try {
      const filter: Record<string, unknown> = {
        schoolId: new Types.ObjectId(schoolId),
        status: { $in: [FinanceInvoiceStatus.PENDING, FinanceInvoiceStatus.PARTIAL] },
        dueAmount: { $gt: 0 },
      };
      if (entityType) filter.entityType = entityType;
      if (entityId) filter.entityId = new Types.ObjectId(entityId);

      return await this.invoiceModel.find(filter).sort({ dueDate: 1 }).exec();
    } catch (error) {
      this.logger.error({
        error,
        message: 'Error finding outstanding invoices',
      });
      throw error;
    }
  }

  // ---------- Entries (with transaction when linked to invoice) ----------
  async createEntry(
    schoolId: string,
    createdBy: string,
    dto: CreateFinanceEntryDto,
  ): Promise<FinanceEntryDocument> {
    const session = await this.entryModel.db.startSession();
    session.startTransaction();
    try {
      const payload = {
        schoolId: new Types.ObjectId(schoolId),
        invoiceId: dto.invoiceId ? new Types.ObjectId(dto.invoiceId) : null,
        entryType: dto.entryType,
        amount: dto.amount,
        paymentMode: dto.paymentMode,
        referenceNumber: dto.referenceNumber,
        fromEntityType: dto.fromEntityType ? dto.fromEntityType : FinanceEntityType.SCHOOL,
        fromEntityId: dto.fromEntityId ? new Types.ObjectId(dto.fromEntityId) : new Types.ObjectId(schoolId),
        toEntityType: dto.toEntityType ? dto.toEntityType : null,
        toEntityId: dto.toEntityId ? new Types.ObjectId(dto.toEntityId) : null,
        notes: dto.notes,
        createdBy: new Types.ObjectId(createdBy),
      };

      if (dto.invoiceId) {
        const invoice = await this.invoiceModel
          .findOne({
            _id: new Types.ObjectId(dto.invoiceId),
            schoolId: new Types.ObjectId(schoolId),
          })
          .session(session)
          .exec();

        if (!invoice) {
          throw new NotFoundException(
            `Finance invoice with id ${dto.invoiceId} not found`,
          );
        }
        if (invoice.status === FinanceInvoiceStatus.CANCELLED) {
          throw new BadRequestException('Cannot add payment to a cancelled invoice');
        }

        const newPaidAmount = invoice.paidAmount + dto.amount;
        if (newPaidAmount > invoice.totalAmount) {
          throw new BadRequestException(
            `Overpayment not allowed. Invoice total: ${invoice.totalAmount}, already paid: ${invoice.paidAmount}, attempted payment: ${dto.amount}`,
          );
        }

        const newDueAmount = Math.max(0, invoice.totalAmount - newPaidAmount);
        const newStatus = FinanceService.computeStatus(
          newPaidAmount,
          invoice.totalAmount,
          invoice.status,
        );

        const entry = new this.entryModel(payload);
        await entry.save({ session });

        await this.invoiceModel
          .findByIdAndUpdate(dto.invoiceId, {
            $set: {
              paidAmount: newPaidAmount,
              dueAmount: newDueAmount,
              status: newStatus,
              updatedAt: new Date(),
            },
          })
          .session(session)
          .exec();

        await session.commitTransaction();
        const saved = await this.entryModel.findById(entry._id).exec();
        if (!saved) throw new Error('Entry not found after save');
        return saved;
      }

      const entry = new this.entryModel(payload);
      await entry.save({ session });
      await session.commitTransaction();
      const saved = await this.entryModel.findById(entry._id).exec();
      if (!saved) throw new Error('Entry not found after save');
      return saved;
    } catch (error) {
      await session.abortTransaction();
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error({ error, message: 'Error creating finance entry' });
      throw error;
    } finally {
      session.endSession();
    }
  }

  async findEntries(
    schoolId: string,
    query: GetEntriesQueryDto,
  ): Promise<FinanceEntryDocument[]> {
    try {
      const filter: Record<string, unknown> = {
        schoolId: new Types.ObjectId(schoolId),
      };
      if (query.invoiceId) filter.invoiceId = new Types.ObjectId(query.invoiceId);
      if (query.fromEntityType) filter.fromEntityType = query.fromEntityType;
      if (query.fromEntityId) filter.fromEntityId = new Types.ObjectId(query.fromEntityId);
      if (query.toEntityType) filter.toEntityType = query.toEntityType;
      if (query.toEntityId) filter.toEntityId = new Types.ObjectId(query.toEntityId);

      return await this.entryModel
        .find(filter)
        .skip(query.offset ?? 0)
        .limit(query.limit ?? 50)
        .sort({ createdAt: -1 })
        .exec();
    } catch (error) {
      this.logger.error({ error, message: 'Error finding finance entries' });
      throw error;
    }
  }

  async findEntryById(
    id: string,
    schoolId: string,
  ): Promise<FinanceEntryDocument | null> {
    try {
      return await this.entryModel
        .findOne({
          _id: new Types.ObjectId(id),
          schoolId: new Types.ObjectId(schoolId),
        })
        .exec();
    } catch (error) {
      this.logger.error({ error, message: 'Error finding finance entry by id' });
      throw error;
    }
  }

  async getLedger(
    schoolId: string,
    entityType: FinanceEntityType,
    entityId: string,
    limit = 100,
  ): Promise<LedgerEntryDto[]> {
    try {
      const oid = new Types.ObjectId(entityId);
      const entries = await this.entryModel
        .find({
          schoolId: new Types.ObjectId(schoolId),
          $or: [
            { fromEntityType: entityType, fromEntityId: oid },
            { toEntityType: entityType, toEntityId: oid },
          ],
        })
        .sort({ createdAt: -1 })
        .limit(limit)
        .exec();

      let running = 0;
      const result: LedgerEntryDto[] = entries.map((entry) => {
        const isCreditToEntity =
          entry.toEntityType === entityType &&
          entry.toEntityId.equals(oid);
        if (entry.entryType === FinanceEntryType.CREDIT) {
          running += isCreditToEntity ? entry.amount : -entry.amount;
        } else {
          running += isCreditToEntity ? -entry.amount : entry.amount;
        }
        return { entry, runningBalance: running };
      });
      return result.reverse();
    } catch (error) {
      this.logger.error({ error, message: 'Error getting ledger' });
      throw error;
    }
  }

  // ---------- Advanced ----------
  async getTotalIncome(schoolId: string): Promise<number> {
    try {
      const schoolOid = new Types.ObjectId(schoolId);
      const result = await this.entryModel
        .aggregate([
          {
            $match: {
              schoolId: schoolOid,
              entryType: FinanceEntryType.CREDIT,
              toEntityType: FinanceEntityType.SCHOOL,
              toEntityId: schoolOid,
            },
          },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ])
        .exec();
      return result[0]?.total ?? 0;
    } catch (error) {
      this.logger.error({ error, message: 'Error getting total income' });
      throw error;
    }
  }

  async getTotalExpense(schoolId: string): Promise<number> {
    try {
      const schoolOid = new Types.ObjectId(schoolId);
      const result = await this.entryModel
        .aggregate([
          {
            $match: {
              schoolId: schoolOid,
              entryType: FinanceEntryType.DEBIT,
              fromEntityType: FinanceEntityType.SCHOOL,
              fromEntityId: schoolOid,
            },
          },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ])
        .exec();
      return result[0]?.total ?? 0;
    } catch (error) {
      this.logger.error({ error, message: 'Error getting total expense' });
      throw error;
    }
  }

  async getStudentOutstandingBalance(
    schoolId: string,
    studentId: string,
  ): Promise<number> {
    try {
      const result = await this.invoiceModel
        .aggregate([
          {
            $match: {
              schoolId: new Types.ObjectId(schoolId),
              entityType: FinanceEntityType.STUDENT,
              entityId: new Types.ObjectId(studentId),
              status: { $in: [FinanceInvoiceStatus.PENDING, FinanceInvoiceStatus.PARTIAL] },
            },
          },
          { $group: { _id: null, outstanding: { $sum: '$dueAmount' } } },
        ])
        .exec();
      return result[0]?.outstanding ?? 0;
    } catch (error) {
      this.logger.error({
        error,
        message: 'Error getting student outstanding balance',
      });
      throw error;
    }
  }

  async getInvoicePaymentHistory(
    invoiceId: string,
    schoolId: string,
  ): Promise<FinanceEntryDocument[]> {
    try {
      const invoice = await this.findInvoiceById(invoiceId, schoolId);
      if (!invoice) {
        throw new NotFoundException(`Finance invoice with id ${invoiceId} not found`);
      }
      return await this.entryModel
        .find({
          schoolId: new Types.ObjectId(schoolId),
          invoiceId: new Types.ObjectId(invoiceId),
        })
        .sort({ createdAt: -1 })
        .exec();
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error({
        error,
        message: 'Error getting invoice payment history',
      });
      throw error;
    }
  }
}
