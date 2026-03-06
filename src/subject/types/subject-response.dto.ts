import { SubjectDocument } from '../schemas/subject.schema';

export interface GetSubjectsResponse {
  data: SubjectDocument[];
  message?: string;
}

export interface GetSubjectResponse {
  data: SubjectDocument | null;
  message?: string;
}
