import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import {
  FinanceEntityType,
  FinanceStructureFrequency,
} from '../finance.enums';

export type FinanceStructureDocument = FinanceStructure & Document;

@Schema({ timestamps: true, collection: 'finance_structures' })
export class FinanceStructure {
  @Prop({ type: Types.ObjectId, ref: 'School', required: true })
  schoolId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({ required: true, enum: FinanceStructureFrequency })
  frequency: FinanceStructureFrequency;

  @Prop({ required: true, enum: FinanceEntityType })
  applicableTo: FinanceEntityType;

  @Prop({ type: Types.ObjectId, ref: 'Class', default: null })
  classId?: Types.ObjectId | null;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const FinanceStructureSchema =
  SchemaFactory.createForClass(FinanceStructure);

FinanceStructureSchema.index({ applicableTo: 1 });
FinanceStructureSchema.index({ classId: 1 });
FinanceStructureSchema.index({ schoolId: 1 });
