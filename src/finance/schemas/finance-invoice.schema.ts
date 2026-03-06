import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import {
  FinanceEntityType,
  FinanceInvoiceStatus,
  FinanceInvoiceType,
} from '../finance.enums';

export type FinanceInvoiceDocument = FinanceInvoice & Document;

@Schema({ timestamps: true, collection: 'finance_invoices' })
export class FinanceInvoice {
  @Prop({ type: Types.ObjectId, ref: 'School', required: true })
  schoolId: Types.ObjectId;

  @Prop({ required: true, unique: true })
  invoiceNumber: string;

  @Prop({ required: true, enum: FinanceInvoiceType })
  invoiceType: FinanceInvoiceType;

  @Prop({ required: true, enum: FinanceEntityType })
  entityType: FinanceEntityType;

  @Prop({ type: Types.ObjectId, required: true })
  entityId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'FinanceStructure', default: null })
  structureId?: Types.ObjectId | null;

  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({ required: true, min: 0 })
  totalAmount: number;

  @Prop({ required: true, min: 0, default: 0 })
  paidAmount: number;

  @Prop({ required: true, min: 0, default: 0 })
  dueAmount: number;

  @Prop({ required: true, enum: FinanceInvoiceStatus, default: FinanceInvoiceStatus.PENDING })
  status: FinanceInvoiceStatus;

  @Prop({ required: true })
  issueDate: Date;

  @Prop({ required: true })
  dueDate: Date;

  @Prop({ type: Object, default: {} })
  meta?: Record<string, unknown>;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const FinanceInvoiceSchema =
  SchemaFactory.createForClass(FinanceInvoice);

FinanceInvoiceSchema.index({ invoiceNumber: 1 }, { unique: true });
FinanceInvoiceSchema.index({ entityType: 1, entityId: 1 });
FinanceInvoiceSchema.index({ status: 1 });
FinanceInvoiceSchema.index({ structureId: 1 });
FinanceInvoiceSchema.index({ schoolId: 1 });
