export interface AssessmentStudent {
  _id: string;
  name: string;
  rollNumber: number;
}

export interface GetAssessmentResponse {
  students: AssessmentStudent[];
  passMark: number;
  maxMark: number;
}

export interface SubmitAssessmentResponse {
  message?: string;
}
