// Shared Student type and seed data for the admission list and view pages.
// Replace getStudentById with a real Prisma query once your backend exists, e.g.:
//
//   export async function getStudentById(id: string) {
//     return prisma.student.findUnique({ where: { id } });
//   }

export interface Student {
  id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  studentId: string;
  faculty: string;
  className: string;
  address: string;
  parentFirstName: string;
  parentLastName: string;
  parentPhone: string;
  parentEmail: string;
  openingBalance: number;
  advance: number;
}

export const FACULTY_OPTIONS = ["Science", "Arts", "Business", "Engineering", "Health Sciences"];
export const CLASS_OPTIONS = ["Form 1 Red", "Form 2 Blue", "Form 3 Green", "Form 4 Gold"];

export const INITIAL_STUDENTS: Student[] = [
  {
    id: "stu-001",
    firstName: "Ralph",
    middleName: "",
    lastName: "Edwards",
    studentId: "STU-2026-001",
    faculty: "Science",
    className: "Form 3 Green",
    address: "Kariakoo, Dar es Salaam",
    parentFirstName: "David",
    parentLastName: "Edwards",
    parentPhone: "+255712000010",
    parentEmail: "david.edwards@example.com",
    openingBalance: 200000,
    advance: 50000,
  },
  {
    id: "stu-002",
    firstName: "Jane",
    middleName: "",
    lastName: "Cooper",
    studentId: "STU-2026-002",
    faculty: "Arts",
    className: "Form 2 Blue",
    address: "Mwenge, Dar es Salaam",
    parentFirstName: "Susan",
    parentLastName: "Cooper",
    parentPhone: "+255712000011",
    parentEmail: "susan.cooper@example.com",
    openingBalance: 150000,
    advance: 0,
  },
  {
    id: "stu-003",
    firstName: "Wade",
    middleName: "",
    lastName: "Warren",
    studentId: "STU-2026-003",
    faculty: "Business",
    className: "Form 3 Green",
    address: "Ilala, Dar es Salaam",
    parentFirstName: "Michael",
    parentLastName: "Warren",
    parentPhone: "+255712000012",
    parentEmail: "michael.warren@example.com",
    openingBalance: 0,
    advance: 100000,
  },
];

export function getStudentById(id: string): Student | undefined {
  return INITIAL_STUDENTS.find((s) => s.id === id);
}