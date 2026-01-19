import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SchoolDocument = School & Document;

export enum SchoolLevel {
  PRIMARY = 'Primary',
  SECONDARY = 'Secondary',
  HIGHER_SECONDARY = 'Higher Secondary',
  COMPOSITE = 'Composite',
}

export enum SchoolBoard {
  CBSE = 'CBSE',
  HSLC = 'HSLC',
  ICSE = 'ICSE',
  STATE_BOARD = 'State Board',
  OTHER = 'Other',
}

export enum SchoolType {
  GOVERNMENT = 'Government',
  PRIVATE = 'Private',
}

@Schema({ timestamps: true })
export class School {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true })
  phone_number: string;

  @Prop({ required: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true, trim: true })
  address_line: string;

  @Prop({ required: true, trim: true })
  city: string;

  @Prop({ required: true, trim: true })
  state: string;

  @Prop({ required: true, trim: true })
  country: string;

  @Prop({ required: true, trim: true })
  pincode: string;

  @Prop({ required: true, enum: SchoolLevel })
  level: SchoolLevel;

  @Prop({ required: true, enum: SchoolBoard })
  board: SchoolBoard;

  @Prop({ required: true, enum: SchoolType })
  type: SchoolType;

  @Prop({ trim: true })
  primary_contact_name?: string;

  @Prop({ trim: true })
  primary_contact_number?: string;

  @Prop({ trim: true })
  logo_url?: string;

  @Prop()
  deleted_at?: Date;
}

export const SchoolSchema = SchemaFactory.createForClass(School);
