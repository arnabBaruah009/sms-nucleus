import { UserDocument } from '../../user/schemas/user.schema';
import { TeacherDocument } from '../schemas/teacher.schema';

export interface TeacherPopulatedDto {
  user_id: UserDocument;
  dob: Date;
  address: string;
  education: {
    yearFrom: number;
    yearTo: number;
    description?: string;
  }[];
  subjects: string[];
  deleted_at?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface GetTeachersResponse {
  data: TeacherDocument[];
  message?: string;
}

export interface GetTeacherResponse {
  data: TeacherDocument | null;
  message?: string;
}
