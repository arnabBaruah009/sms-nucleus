import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ExamSubjectDocument = ExamSubject & Document;

@Schema({ timestamps: true })
export class ExamSubject {
  @Prop({ type: Types.ObjectId, ref: 'Exam', required: true })
  examId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Subject', required: true })
  subjectId: Types.ObjectId;

  @Prop({ required: true })
  maxMarks: number;

  @Prop({ required: true })
  passMarks: number;
}

export const ExamSubjectSchema = SchemaFactory.createForClass(ExamSubject);
