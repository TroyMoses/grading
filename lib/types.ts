// types.ts
export interface Lecturer {
    _id: string;
    name: string;
    userId: string;
  }
  
  export interface LecturerDetail {
    lecturerId: string;
    subjectId: string;
    qualification: string;
    experience: string;
    publications: string;
    feedback: string;
    professionalCertificate: boolean;
  }
  
  export interface Subject {
    _id: string;
    name: string;
    year: number;
    semester: number;
    department: string;
  }
  