import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SchoolDocument = School & Document;

@Schema({ timestamps: true })
export class School {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  phone_number: string;

  @Prop({ required: true })
  address: string;

  @Prop()
  type?: string; // Primary/Secondary/etc

  @Prop()
  board?: string; // CBSE/HSLC/etc

  @Prop()
  logo_url?: string;

  @Prop()
  deleted_at?: Date;
}

export const SchoolSchema = SchemaFactory.createForClass(School);
