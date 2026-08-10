export const PENDING_STUDENT_IMPORT_KEY = "pendingStudentImport";

export interface RequiredField {
  key: string;
  label: string;
  required: boolean;
}

export const REQUIRED_FIELDS: RequiredField[] = [
  { key: "firstName", label: "First Name", required: true },
  { key: "middleName", label: "Middle Name", required: false },
  { key: "lastName", label: "Last Name", required: true },
  { key: "studentId", label: "Student ID", required: true },
  { key: "faculty", label: "Faculty", required: false },
  { key: "className", label: "Class", required: false },
  { key: "address", label: "Address", required: false },
  { key: "parentFirstName", label: "Parent First Name", required: false },
  { key: "parentLastName", label: "Parent Last Name", required: false },
  { key: "parentPhone", label: "Parent Phone", required: false },
  { key: "parentEmail", label: "Parent Email", required: false },
  { key: "openingBalance", label: "Opening Balance", required: false },
  { key: "advance", label: "Advance", required: false },
];

const EXAMPLE_ROW = [
  "Ralph", "", "Edwards", "STU-2026-004", "Science", "Form 3 Green",
  "Kariakoo, Dar es Salaam", "David", "Edwards", "+255712000010",
  "david.edwards@example.com", "200000", "50000",
];

export function downloadStudentTemplate() {
  const headers = REQUIRED_FIELDS.map((f) => f.key).join(",");
  const rows = [headers, EXAMPLE_ROW.join(",")];
  const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "student-import-template.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Best-effort auto-match: normalize both sides and compare.
export function guessColumnMatch(fieldKey: string, fieldLabel: string, headers: string[]): string {
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  const targetKey = normalize(fieldKey);
  const targetLabel = normalize(fieldLabel);
  const match = headers.find((h) => {
    const nh = normalize(h);
    return nh === targetKey || nh === targetLabel;
  });
  return match ?? "";
}