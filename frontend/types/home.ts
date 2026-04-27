import { Instructor } from "./user";

export type HomeInstructor = Instructor & {
  specialty: string;
  learners: string;
  courseCount: number;
};
