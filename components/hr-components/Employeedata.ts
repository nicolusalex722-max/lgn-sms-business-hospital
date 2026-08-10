import type { Employee } from "./Employeetable";

// Shared seed data for both the Employee list and the Employee profile page.
// Replace with a real Prisma query once your backend is wired up, e.g.:
//
//   export async function getEmployeeById(id: string) {
//     return prisma.employee.findUnique({ where: { id } });
//   }

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: "emp-001",
    firstName: "Asha",
    middleName: "",
    lastName: "Mwakalinga",
    email: "asha@izackenterprises.com",
    department: "Finance",
    branch: "Head Office",
    phone: "+255712345678",
    salary: 1200000,
    birthdate: "1992-04-12",
    position: "Finance Manager",
    nextOfKin: "James Mwakalinga",
    guarantorPhone: "+255712000001",
  },
  {
    id: "emp-002",
    firstName: "John",
    middleName: "David",
    lastName: "Mushi",
    email: "john@izackenterprises.com",
    department: "Information Technology",
    branch: "Head Office",
    phone: "+255713111222",
    salary: 1500000,
    birthdate: "1990-09-03",
    position: "IT Officer",
    nextOfKin: "Grace Mushi",
    guarantorPhone: "+255713000002",
  },
  {
    id: "emp-003",
    firstName: "Neema",
    middleName: "",
    lastName: "Kilonzo",
    email: "neema@izackenterprises.com",
    department: "Customer Service",
    branch: "Mwanza Branch",
    phone: "+255714222333",
    salary: 850000,
    birthdate: "1995-01-20",
    position: "Customer Service Rep",
    nextOfKin: "Peter Kilonzo",
    guarantorPhone: "+255714000003",
  },
];

export function getEmployeeById(id: string): Employee | undefined {
  return INITIAL_EMPLOYEES.find((e) => e.id === id);
}