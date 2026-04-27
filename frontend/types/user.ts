export type Instructor = {
  _id: string;
  name: string;
  email: string;
  avatar: string | null;
  role?: string;
  stats?: {
    enrolledCoursesCount?: number;
    createdCoursesCount?: number;
  };
};
export type User = {
  _id: string;
  name: string;
  email: string;
  avatar: string | null;
  role?: string;
  stats?: {
    enrolledCoursesCount?: number;
    createdCoursesCount?: number;
  };
};
