import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type StudentDocument = Student & Document;

@Schema({ timestamps: true })
export class Student {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  user_id: Types.ObjectId;

  @Prop({ required: true })
  dob: Date;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  class: string;

  @Prop({ required: true })
  section: string;

  @Prop({ required: true })
  rollNumber: number;

  @Prop({
    type: [
      {
        yearFrom: Number,
        yearTo: Number,
        description: String,
      },
    ],
    default: [],
  })
  education: { yearFrom: number; yearTo: number; description: string }[];

  @Prop()
  about?: string;

  @Prop()
  department?: string;

  @Prop()
  deleted_at?: Date;
}

export const StudentSchema = SchemaFactory.createForClass(Student);

StudentSchema.index({ user_id: 1 }, { unique: true });
