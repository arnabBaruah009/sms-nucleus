import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type StudentMarkDocument = StudentMark & Document;

@Schema({ timestamps: true })
export class StudentMark {
  @Prop({ type: Types.ObjectId, ref: 'Student', required: true })
  studentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Exam', required: true })
  examId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Subject', required: true })
  subjectId: Types.ObjectId;

  @Prop({ required: true })
  marksObtained: number;

  @Prop({ trim: true })
  remarks?: string;
}

export const StudentMarkSchema = SchemaFactory.createForClass(StudentMark);
