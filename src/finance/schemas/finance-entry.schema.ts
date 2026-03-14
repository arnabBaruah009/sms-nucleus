import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import {
  FinanceEntityType,
  FinanceEntryType,
  FinancePaymentMode,
} from '../finance.enums';

export type FinanceEntryDocument = FinanceEntry & Document;

@Schema({ timestamps: true, collection: 'finance_entries' })
export class FinanceEntry {
  @Prop({ type: Types.ObjectId, ref: 'School', required: true })
  schoolId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'FinanceInvoice', default: null })
  invoiceId?: Types.ObjectId | null;

  @Prop({ required: true, enum: FinanceEntryType })
  entryType: FinanceEntryType;

  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({ required: true, enum: FinancePaymentMode })
  paymentMode: FinancePaymentMode;

  @Prop()
  referenceNumber?: string;

  @Prop({ enum: FinanceEntityType })
  fromEntityType: FinanceEntityType;

  @Prop({ type: Types.ObjectId })
  fromEntityId: Types.ObjectId;

  @Prop({ enum: FinanceEntityType })
  toEntityType: FinanceEntityType;

  @Prop({ type: Types.ObjectId })
  toEntityId: Types.ObjectId;

  @Prop()
  notes?: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const FinanceEntrySchema = SchemaFactory.createForClass(FinanceEntry);

FinanceEntrySchema.index({ invoiceId: 1 });
FinanceEntrySchema.index({ fromEntityType: 1, fromEntityId: 1 });
FinanceEntrySchema.index({ toEntityType: 1, toEntityId: 1 });
FinanceEntrySchema.index({ createdAt: -1 });
FinanceEntrySchema.index({ schoolId: 1 });
