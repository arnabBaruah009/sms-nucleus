import { ExamDocument } from '../schemas/exam.schema';

export interface GetExamsResponse {
  data: ExamDocument[];
  message?: string;
}

export interface GetExamResponse {
  data: ExamDocument | null;
  message?: string;
}
