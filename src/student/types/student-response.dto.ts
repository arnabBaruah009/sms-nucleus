import { UserDocument } from "src/user/schemas/user.schema";
import { StudentDocument } from "../schemas/student.schema";

export type Gender = 'Male' | 'Female' | 'Other';

export interface EducationEntry {
  yearFrom: number;
  yearTo: number;
  description: string;
}

export interface StudentPopulatedDto {
  user_id: UserDocument;
  dob: Date;
  address: string;
  education: {
    yearFrom: number;
    yearTo: number;
    description?: string;
  }[];
  about?: string;
  department?: string;
  deleted_at?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface GetStudentsResponse {
  data: StudentDocument[];
  message?: string;
}

export interface GetStudentResponse {
  data: StudentDocument | null;
  message?: string;
}
