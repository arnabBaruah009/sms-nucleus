import { UserRole } from '../schemas/user.schema';
import { SchoolLevel, SchoolBoard, SchoolType } from '../../school/schemas/school.schema';

export type Gender = 'male' | 'female' | 'other';

export interface SchoolDetails {
  id: string;
  name: string;
  phone_number: string;
  email: string;
  address_line: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  level: SchoolLevel;
  board: SchoolBoard;
  type: SchoolType;
  primary_contact_name?: string;
  primary_contact_number?: string;
  logo_url?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface ProfileDetails {
  id: string;
  name: string;
  phone_number: string;
  email: string;
  avatar_url?: string;
  gender?: Gender;
  role: UserRole;
  isEmailVerified: boolean;
  school_id?: string;
  school?: SchoolDetails;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface GetProfileResponse {
  data: ProfileDetails;
  message?: string;
}

export interface UpdateProfileResponse {
  data: ProfileDetails;
  message?: string;
}
