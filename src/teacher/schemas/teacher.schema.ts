import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TeacherDocument = Teacher & Document;

@Schema({ timestamps: true })
export class Teacher {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  user_id: Types.ObjectId;

  @Prop({ required: true })
  dob: Date;

  @Prop({ required: true })
  address: string;

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

  @Prop({ type: [String], default: [] })
  subjects: string[];

  @Prop()
  deleted_at?: Date;
}

export const TeacherSchema = SchemaFactory.createForClass(Teacher);

TeacherSchema.index({ user_id: 1 }, { unique: true });
