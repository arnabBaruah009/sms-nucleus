import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SubjectDocument = Subject & Document;

@Schema({ timestamps: true })
export class Subject {
  @Prop({ type: Types.ObjectId, ref: 'School', required: true })
  schoolId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ trim: true })
  code?: string;

  @Prop()
  deleted_at?: Date;
}

export const SubjectSchema = SchemaFactory.createForClass(Subject);

SubjectSchema.index(
  { schoolId: 1, name: 1 },
  { unique: true, partialFilterExpression: { deleted_at: null } },
);
