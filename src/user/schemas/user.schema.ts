import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
  ADMIN = 'admin',
  TEACHER = 'teacher',
  STAFF = 'staff',
  STUDENT = 'student',
}

@Schema({ timestamps: true })
export class User {
  @Prop()
  name: string;

  @Prop({ unique: true })
  phone_number: string;

  @Prop({ unique: true, lowercase: true })
  email?: string;

  @Prop()
  avatar_url?: string;

  @Prop()
  gender?: string;

  @Prop({ enum: UserRole, default: UserRole.STUDENT })
  role: UserRole;

  @Prop({ required: true })
  password: string;

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop({ type: String, ref: 'School' })
  school_id?: string;

  @Prop()
  deleted_at?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
