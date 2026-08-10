export const PENDING_IMPORT_KEY = "pendingEmployeeImport";

export const TEMPLATE_HEADERS = [
  "firstName",
  "middleName",
  "lastName",
  "email",
  "department",
  "branch",
  "phone",
  "salary",
  "birthdate",
  "position",
  "nextOfKin",
  "guarantorPhone",
];

const EXAMPLE_ROW = [
  "Asha",
  "",
  "Mwakalinga",
  "asha@example.com",
  "Finance",
  "Head Office",
  "+255712345678",
  "1200000",
  "1992-04-12",
  "Finance Manager",
  "James Mwakalinga",
  "+255712000001",
];

export function downloadEmployeeTemplate() {
  const rows = [TEMPLATE_HEADERS.join(","), EXAMPLE_ROW.join(",")];
  const csvContent = rows.join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "employee-import-template.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}