import { UserDocument } from '../schemas/user.schema';

export interface GetProfileResponse {
  data: UserDocument;
  message?: string;
}

export interface UpdateProfileResponse {
  data: UserDocument;
  message?: string;
}
