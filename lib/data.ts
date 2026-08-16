import { Account } from "./types";

export function seedAccounts(): Account[] {
  return [
    {
      code: "1000",
      name: "Cash on Hand",
      type: "Asset",
      currency: "TSh",
      description: "Petty cash and till balances",
      transactions: [
        { id: "t1", date: "2026-07-01", by: "A. Mushi", description: "Opening balance", debit: 500000, credit: 0 },
        { id: "t2", date: "2026-07-08", by: "F. Kessy", description: "Office supplies purchase", debit: 0, credit: 45000 },
        { id: "t3", date: "2026-07-19", by: "A. Mushi", description: "Cash deposit from sales", debit: 220000, credit: 0 },
      ],
    },
    {
      code: "1100",
      name: "Accounts Receivable",
      type: "Asset",
      currency: "TSh",
      description: "Amounts owed by customers",
      transactions: [
        { id: "t1", date: "2026-07-03", by: "N. Mrema", description: "Invoice #A-204 issued", debit: 380000, credit: 0 },
        { id: "t2", date: "2026-07-21", by: "N. Mrema", description: "Payment received, Invoice #A-204", debit: 0, credit: 380000 },
        { id: "t3", date: "2026-07-29", by: "F. Kessy", description: "Invoice #A-211 issued", debit: 150000, credit: 0 },
      ],
    },
    {
      code: "2000",
      name: "Accounts Payable",
      type: "Liability",
      currency: "TSh",
      description: "Amounts owed to suppliers",
      transactions: [
        { id: "t1", date: "2026-07-05", by: "F. Kessy", description: "Bill from Kilimanjaro Supplies", debit: 0, credit: 260000 },
        { id: "t2", date: "2026-07-25", by: "A. Mushi", description: "Payment to Kilimanjaro Supplies", debit: 120000, credit: 0 },
      ],
    },
    {
      code: "3000",
      name: "Owner's Equity",
      type: "Equity",
      currency: "TSh",
      description: "Owner capital contributions",
      transactions: [
        { id: "t1", date: "2026-07-01", by: "A. Mushi", description: "Initial capital contribution", debit: 0, credit: 1200000 },
      ],
    },
    {
      code: "4000",
      name: "Sales Revenue",
      type: "Revenue",
      currency: "TSh",
      description: "Income from goods and services sold",
      transactions: [
        { id: "t1", date: "2026-07-10", by: "N. Mrema", description: "Product sales, week 2", debit: 0, credit: 640000 },
        { id: "t2", date: "2026-07-24", by: "N. Mrema", description: "Product sales, week 4", debit: 0, credit: 510000 },
      ],
    },
    {
      code: "5000",
      name: "Rent Expense",
      type: "Expense",
      currency: "TSh",
      description: "Monthly premises rent",
      transactions: [
        { id: "t1", date: "2026-07-01", by: "A. Mushi", description: "July rent payment", debit: 300000, credit: 0 },
      ],
    },
  ];
}


import type { Book, Branch, BookRequest, Loan, LibraryPolicy } from "./types";

export const CATEGORIES = [
  "Fiction",
  "Non-Fiction",
  "Science",
  "Technology",
  "Children",
  "Biography",
  "History",
];

export const DEFAULT_POLICY: LibraryPolicy = {
  loanDurationDays: 14,
  maxBooksPerMember: 4,
  renewalLimit: 1,
  lateFeePerDay: 500, // TZS
};


export const MOCK_BOOKS: Book[] = [
  {
    id: "bk1",
    title: "Things Fall Apart",
    author: "Chinua Achebe",
    isbn: "978-0385474542",
    category: "Fiction",
    publisher: "Anchor Books",
    year: 1994,
    totalCopies: 6,
    availableCopies: 2,
  },
  {
    id: "bk2",
    title: "A Brief History of Time",
    author: "Stephen Hawking",
    isbn: "978-0553380163",
    category: "Science",
    publisher: "Bantam",
    year: 1998,
    totalCopies: 4,
    availableCopies: 0,
  },
  {
    id: "bk3",
    title: "Clean Code",
    author: "Robert C. Martin",
    isbn: "978-0132350884",
    category: "Technology",
    publisher: "Prentice Hall",
    year: 2008,
    totalCopies: 5,
    availableCopies: 5,
  },
  {
    id: "bk4",
    title: "Long Walk to Freedom",
    author: "Nelson Mandela",
    isbn: "978-0316548182",
    category: "Biography",
    publisher: "Little, Brown",
    year: 1995,
    totalCopies: 3,
    availableCopies: 1,
  },
  {
    id: "bk5",
    title: "The Wretched of the Earth",
    author: "Frantz Fanon",
    isbn: "978-0802141323",
    category: "History",
    publisher: "Grove Press",
    year: 2004,
    totalCopies: 2,
    availableCopies: 2,
  },
];

export const MOCK_REQUESTS: BookRequest[] = [
  { id: "r1", memberName: "Amina Juma", bookId: "bk2", bookTitle: "A Brief History of Time", requestDate: "2026-08-02", status: "Pending" },
  { id: "r2", memberName: "David Mushi", bookId: "bk3", bookTitle: "Clean Code", requestDate: "2026-08-03", status: "Pending" },
  { id: "r3", memberName: "Grace Kileo", bookId: "bk1", bookTitle: "Things Fall Apart", requestDate: "2026-07-28", status: "Approved" },
];

export const MOCK_LOANS: Loan[] = [
  {
    id: "l1",
    memberName: "Grace Kileo",
    bookTitle: "Things Fall Apart",
    borrowDate: "2026-07-29",
    dueDate: "2026-08-12",
    returnDate: null,
    status: "Active",
  },
  {
    id: "l2",
    memberName: "Joseph Mwangi",
    bookTitle: "A Brief History of Time",
    borrowDate: "2026-07-18",
    dueDate: "2026-08-01",
    returnDate: null,
    status: "Overdue",
  },
  {
    id: "l3",
    memberName: "Neema Shirima",
    bookTitle: "Long Walk to Freedom",
    borrowDate: "2026-07-10",
    dueDate: "2026-07-24",
    returnDate: "2026-07-22",
    status: "Returned",
  },
];

//Payment data
import type { Party, AccountPayment, TransactionPayment } from "./types";

export const PARTIES: Party[] = [
  { id: "s1", name: "Amina Juma", type: "Student", balance: 150000 },
  { id: "s2", name: "David Mushi", type: "Student", balance: 0 },
  { id: "s3", name: "Grace Kileo", type: "Student", balance: 45000 },
  { id: "s4", name: "Joseph Mwangi", type: "Student", balance: 260000 },
  { id: "sp1", name: "NMB Stationery Ltd", type: "Supplier", balance: 320000 },
  { id: "sp2", name: "TecPrint Suppliers", type: "Supplier", balance: 0 },
  { id: "sp3", name: "Kilimanjaro Foods Co.", type: "Supplier", balance: 87000 },
];

export const ACCOUNTS: AccountPayment[] = [
  { code: "1100", name: "NMB Bank" },
  { code: "1101", name: "Cash on Hand" },
  { code: "1103", name: "Mobile Money Wallet" },
  { code: "1104", name: "CRDB Bank" },
];

export const PAYMENT_METHODS: readonly ["Mobile Money", "Cash", "Bank"] = ["Mobile Money", "Cash", "Bank"];

export const MOCK_TRANSACTIONS: TransactionPayment[] = [
  {
    id: "t1",
    type: "Receive",
    date: "2026-08-05",
    amount: 200000,
    method: "Mobile Money",
    partyName: "Amina Juma",
    partyType: "Student",
    reference: "MP240805",
  },
  {
    id: "t2",
    type: "Pay",
    date: "2026-08-04",
    amount: 120000,
    method: "Bank",
    partyName: "NMB Stationery Ltd",
    partyType: "Supplier",
    reference: "INV-2291",
  },
  {
    id: "t3",
    type: "Transfer",
    date: "2026-08-03",
    amount: 500000,
    method: "Account Transfer",
    fromAccount: "NMB Bank",
    toAccount: "Cash on Hand",
    note: "Weekly cash float top-up",
  },
  {
    id: "t4",
    type: "Receive",
    date: "2026-08-01",
    amount: 90000,
    method: "Cash",
    partyName: "Grace Kileo",
    partyType: "Student",
  },
  {
    id: "t5",
    type: "Pay",
    date: "2026-07-30",
    amount: 65000,
    method: "Mobile Money",
    partyName: "Kilimanjaro Foods Co.",
    partyType: "Supplier",
    reference: "PO-1187",
  },
];

//Billing
import type { BillingDocument, CompanyInfo } from "./types";

export const COMPANY: CompanyInfo = {
  name: "ZACBOOK INC",
  branch: "Arusha Seven Eleven Branch",
  phone: "+255741608048",
  email: "info@izackenterprises.com",
  address: ["Moshi street", "25101", "Tanzania"],
  website: "https://zacbook.com",
};

export const MOCK_DOCUMENTS: BillingDocument[] = [
  // --- Bills (Supplier) ---
  {
    id: "b1",
    type: "bill",
    number: "BILL-000005",
    partyName: "Izack HQ",
    partyRole: "Supplier",
    partyEmail: "info@izackenterprises.com",
    date: "2026-07-27",
    dueDate: "2026-08-26",
    items: [{ id: "i1", description: "Bulk goods purchase", qty: 1, unitPrice: 47000000, discount: 0 }],
    taxRate: 0,
    payments: [],
  },
  {
    id: "b2",
    type: "bill",
    number: "BILL-000004",
    partyName: "TecPrint Suppliers",
    partyRole: "Supplier",
    partyEmail: "accounts@tecprint.co.tz",
    date: "2026-07-15",
    dueDate: "2026-08-14",
    items: [
      { id: "i1", description: "Banner printing", qty: 10, unitPrice: 15000, discount: 0 },
      { id: "i2", description: "Flyer printing", qty: 500, unitPrice: 300, discount: 0 },
    ],
    taxRate: 18,
    payments: [{ id: "p1", date: "2026-07-20", amount: 100000, method: "Bank", reference: "INV-6621" }],
  },
  {
    id: "b3",
    type: "bill",
    number: "BILL-000003",
    partyName: "Kilimanjaro Foods Co.",
    partyRole: "Supplier",
    date: "2026-06-10",
    dueDate: "2026-07-10",
    items: [{ id: "i1", description: "Kitchen equipment repair", qty: 1, unitPrice: 65000, discount: 0 }],
    taxRate: 0,
    payments: [{ id: "p1", date: "2026-06-12", amount: 65000, method: "Cash" }],
  },
  {
    id: "b4",
    type: "bill",
    number: "BILL-000002",
    partyName: "NMB Stationery Ltd",
    partyRole: "Supplier",
    date: "2026-05-02",
    dueDate: "2026-06-01",
    items: [{ id: "i1", description: "Office stationery restock", qty: 1, unitPrice: 220000, discount: 10000 }],
    taxRate: 0,
    payments: [],
  },

  // --- Invoices (Customer) ---
  {
    id: "n1",
    type: "invoice",
    number: "INV-239778",
    partyName: "Maliki Paul",
    partyRole: "Customer",
    partyPhone: "+255741607848",
    partyEmail: "info@izackenterprises.com",
    date: "2026-07-27",
    dueDate: "2026-07-27",
    items: [{ id: "i1", description: "USB SMART PHONE", qty: 2, unitPrice: 45000, discount: 0 }],
    taxRate: 0,
    payments: [],
  },
  {
    id: "n2",
    type: "invoice",
    number: "INV-239770",
    partyName: "Grace Kileo",
    partyRole: "Customer",
    partyPhone: "+255754112233",
    partyEmail: "grace.kileo@example.com",
    date: "2026-07-18",
    dueDate: "2026-08-01",
    items: [
      { id: "i1", description: "Consulting services — July", qty: 8, unitPrice: 25000, discount: 0 },
    ],
    taxRate: 18,
    payments: [{ id: "p1", date: "2026-07-25", amount: 100000, method: "Mobile Money", reference: "MP240725" }],
  },
  {
    id: "n3",
    type: "invoice",
    number: "INV-239755",
    partyName: "David Mushi",
    partyRole: "Customer",
    partyEmail: "david.mushi@example.com",
    date: "2026-06-20",
    dueDate: "2026-07-04",
    items: [{ id: "i1", description: "Website maintenance — June", qty: 1, unitPrice: 180000, discount: 0 }],
    taxRate: 0,
    payments: [{ id: "p1", date: "2026-06-25", amount: 180000, method: "Bank", reference: "TT-88213" }],
  },
  {
    id: "n4",
    type: "invoice",
    number: "INV-239740",
    partyName: "Amina Juma",
    partyRole: "Customer",
    partyEmail: "amina.juma@example.com",
    date: "2026-06-05",
    dueDate: "2026-06-19",
    items: [{ id: "i1", description: "Tuition fees — Term 2", qty: 1, unitPrice: 350000, discount: 0 }],
    taxRate: 0,
    payments: [],
  },
];


//Budget
import type { Budget, BudgetPeriodType } from "./types";

export const CATEGORIESBUDGET = [
  "Utilities",
  "Rent",
  "Salaries & Wages",
  "Office Supplies",
  "Maintenance & Repairs",
  "Transport",
  "Marketing",
  "Professional Fees",
  "Other",
];

export const PERIOD_TYPES: BudgetPeriodType[] = ["Monthly", "Quarterly", "Yearly"];

export const MOCK_BUDGETS: Budget[] = [
  {
    id: "bg1",
    category: "Utilities",
    periodType: "Monthly",
    periodLabel: "August 2026",
    startDate: "2026-08-01",
    endDate: "2026-08-31",
    allocated: 250000,
    movements: [{ id: "m1", date: "2026-08-05", amount: 180000, note: "TANESCO electricity bill" }],
  },
  {
    id: "bg2",
    category: "Office Supplies",
    periodType: "Monthly",
    periodLabel: "August 2026",
    startDate: "2026-08-01",
    endDate: "2026-08-31",
    allocated: 100000,
    movements: [
      { id: "m1", date: "2026-08-04", amount: 95000, note: "Printer paper, toner, folders" },
      { id: "m2", date: "2026-08-06", amount: 18000, note: "Extra folders" },
    ],
  },
  {
    id: "bg3",
    category: "Marketing",
    periodType: "Quarterly",
    periodLabel: "Q3 2026",
    startDate: "2026-07-01",
    endDate: "2026-09-30",
    allocated: 600000,
    movements: [{ id: "m1", date: "2026-07-20", amount: 150000, note: "Banner and flyer printing" }],
  },
  {
    id: "bg4",
    category: "Transport",
    periodType: "Monthly",
    periodLabel: "August 2026",
    startDate: "2026-08-01",
    endDate: "2026-08-31",
    allocated: 80000,
    movements: [{ id: "m1", date: "2026-08-02", amount: 32000, note: "Staff transport to branch meeting" }],
  },
  {
    id: "bg5",
    category: "Salaries & Wages",
    periodType: "Monthly",
    periodLabel: "July 2026",
    startDate: "2026-07-01",
    endDate: "2026-07-31",
    allocated: 4200000,
    movements: [{ id: "m1", date: "2026-07-31", amount: 4200000, note: "Payroll — July" }],
  },
  {
    id: "bg6",
    category: "Maintenance & Repairs",
    periodType: "Yearly",
    periodLabel: "2026",
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    allocated: 500000,
    movements: [{ id: "m1", date: "2026-07-28", amount: 65000, note: "Kitchen equipment repair" }],
  },
];

//Results
import type { Student, SubjectResult } from "./types";
import { computeGrade } from "./grading";

export const CLASSES = ["Form 1A", "Form 1B", "Form 2A", "Form 2B", "Form 3A", "Form 4A"];

export const SUBJECTS = [
  "Mathematics",
  "English",
  "Kiswahili",
  "Physics",
  "Chemistry",
  "Biology",
  "Geography",
  "History",
  "Civics",
  "Commerce",
];

export const EXAM_TYPES = ["Mid-Term Exam", "Final Exam", "Mock Exam", "Continuous Assessment"];

export const MOCK_STUDENTS: Student[] = [
  { id: "STD-1001", name: "Amina Juma", className: "Form 2A" },
  { id: "STD-1002", name: "David Mushi", className: "Form 2A" },
  { id: "STD-1003", name: "Grace Kileo", className: "Form 2A" },
  { id: "STD-1004", name: "Joseph Mwangi", className: "Form 2A" },
  { id: "STD-1005", name: "Neema Shirima", className: "Form 2A" },
  { id: "STD-2001", name: "Baraka Msigwa", className: "Form 1A" },
  { id: "STD-2002", name: "Fatuma Ally", className: "Form 1A" },
  { id: "STD-2003", name: "Hassan Kimaro", className: "Form 1A" },
];

function makeResult(
  id: string,
  studentId: string,
  studentName: string,
  className: string,
  examType: string,
  subject: string,
  marks: number
): SubjectResult {
  return { id, studentId, studentName, className, examType, subject, marks, grade: computeGrade(marks) };
}

export const MOCK_RESULTS: SubjectResult[] = [
  // Amina Juma — Form 2A — Mid-Term Exam
  makeResult("r1", "STD-1001", "Amina Juma", "Form 2A", "Mid-Term Exam", "Mathematics", 82),
  makeResult("r2", "STD-1001", "Amina Juma", "Form 2A", "Mid-Term Exam", "English", 74),
  makeResult("r3", "STD-1001", "Amina Juma", "Form 2A", "Mid-Term Exam", "Kiswahili", 68),
  makeResult("r4", "STD-1001", "Amina Juma", "Form 2A", "Mid-Term Exam", "Physics", 55),
  makeResult("r5", "STD-1001", "Amina Juma", "Form 2A", "Mid-Term Exam", "Chemistry", 61),
  makeResult("r6", "STD-1001", "Amina Juma", "Form 2A", "Mid-Term Exam", "Biology", 70),
  makeResult("r7", "STD-1001", "Amina Juma", "Form 2A", "Mid-Term Exam", "Geography", 48),

  // David Mushi — Form 2A — Mid-Term Exam
  makeResult("r8", "STD-1002", "David Mushi", "Form 2A", "Mid-Term Exam", "Mathematics", 38),
  makeResult("r9", "STD-1002", "David Mushi", "Form 2A", "Mid-Term Exam", "English", 42),
  makeResult("r10", "STD-1002", "David Mushi", "Form 2A", "Mid-Term Exam", "Kiswahili", 55),
  makeResult("r11", "STD-1002", "David Mushi", "Form 2A", "Mid-Term Exam", "Physics", 25),
  makeResult("r12", "STD-1002", "David Mushi", "Form 2A", "Mid-Term Exam", "Chemistry", 31),
  makeResult("r13", "STD-1002", "David Mushi", "Form 2A", "Mid-Term Exam", "Biology", 40),
  makeResult("r14", "STD-1002", "David Mushi", "Form 2A", "Mid-Term Exam", "Geography", 29),

  // Grace Kileo — Form 2A — Mid-Term Exam
  makeResult("r15", "STD-1003", "Grace Kileo", "Form 2A", "Mid-Term Exam", "Mathematics", 91),
  makeResult("r16", "STD-1003", "Grace Kileo", "Form 2A", "Mid-Term Exam", "English", 88),
  makeResult("r17", "STD-1003", "Grace Kileo", "Form 2A", "Mid-Term Exam", "Kiswahili", 79),
  makeResult("r18", "STD-1003", "Grace Kileo", "Form 2A", "Mid-Term Exam", "Physics", 84),
  makeResult("r19", "STD-1003", "Grace Kileo", "Form 2A", "Mid-Term Exam", "Chemistry", 77),
  makeResult("r20", "STD-1003", "Grace Kileo", "Form 2A", "Mid-Term Exam", "Biology", 90),
  makeResult("r21", "STD-1003", "Grace Kileo", "Form 2A", "Mid-Term Exam", "Geography", 81),

  // Baraka Msigwa — Form 1A — Final Exam
  makeResult("r22", "STD-2001", "Baraka Msigwa", "Form 1A", "Final Exam", "Mathematics", 60),
  makeResult("r23", "STD-2001", "Baraka Msigwa", "Form 1A", "Final Exam", "English", 58),
  makeResult("r24", "STD-2001", "Baraka Msigwa", "Form 1A", "Final Exam", "Kiswahili", 72),
];

//Attendance
import type { AttendanceRecord, StudentAttendance } from "./types";

export const CLASSES_ATTENDANCE = ["Form 1A", "Form 1B", "Form 2A", "Form 2B", "Form 3A", "Form 4A"];

export const SUBJECTS_ATTENDANCE = [
  "Mathematics",
  "English",
  "Kiswahili",
  "Physics",
  "Chemistry",
  "Biology",
  "Geography",
  "History",
  "Civics",
  "Commerce",
];

/**
 * Convention-based path into /public/students. Drop a matching file there
 * (e.g. public/students/STD-1001.jpg) and it'll be picked up automatically —
 * StudentAvatar falls back to initials if the file doesn't exist yet, so
 * nothing breaks in the meantime.
 */
function photoFor(id: string) {
  return `/students/${id}.jpg`;
}

export const MOCK_STUDENTS_ATTENDANCE: Student[] = [
  { id: "STD-1001", name: "Amina Juma", className: "Form 2A", photoUrl: photoFor("STD-1001") },
  { id: "STD-1002", name: "David Mushi", className: "Form 2A", photoUrl: photoFor("STD-1002") },
  { id: "STD-1003", name: "Grace Kileo", className: "Form 2A", photoUrl: photoFor("STD-1003") },
  { id: "STD-1004", name: "Joseph Mwangi", className: "Form 2A", photoUrl: photoFor("STD-1004") },
  { id: "STD-1005", name: "Neema Shirima", className: "Form 2A", photoUrl: photoFor("STD-1005") },
  { id: "STD-2001", name: "Baraka Msigwa", className: "Form 1A", photoUrl: photoFor("STD-2001") },
  { id: "STD-2002", name: "Fatuma Ally", className: "Form 1A", photoUrl: photoFor("STD-2002") },
  { id: "STD-2003", name: "Hassan Kimaro", className: "Form 1A", photoUrl: photoFor("STD-2003") },
];

export const MOCK_RECORDS: AttendanceRecord[] = [
  {
    id: "att1",
    className: "Form 2A",
    subject: "Mathematics",
    date: "2026-08-06",
    takenAt: "2026-08-06T08:15:00.000Z",
    entries: [
      { studentId: "STD-1001", studentName: "Amina Juma", photoUrl: photoFor("STD-1001"), status: "Present" },
      { studentId: "STD-1002", studentName: "David Mushi", photoUrl: photoFor("STD-1002"), status: "Present" },
      { studentId: "STD-1003", studentName: "Grace Kileo", photoUrl: photoFor("STD-1003"), status: "Absent" },
      { studentId: "STD-1004", studentName: "Joseph Mwangi", photoUrl: photoFor("STD-1004"), status: "Present" },
      { studentId: "STD-1005", studentName: "Neema Shirima", photoUrl: photoFor("STD-1005"), status: "Present" },
    ],
  },
  {
    id: "att2",
    className: "Form 2A",
    subject: "English",
    date: "2026-08-05",
    takenAt: "2026-08-05T09:00:00.000Z",
    entries: [
      { studentId: "STD-1001", studentName: "Amina Juma", photoUrl: photoFor("STD-1001"), status: "Present" },
      { studentId: "STD-1002", studentName: "David Mushi", photoUrl: photoFor("STD-1002"), status: "Absent" },
      { studentId: "STD-1003", studentName: "Grace Kileo", photoUrl: photoFor("STD-1003"), status: "Present" },
      { studentId: "STD-1004", studentName: "Joseph Mwangi", photoUrl: photoFor("STD-1004"), status: "Absent" },
      { studentId: "STD-1005", studentName: "Neema Shirima", photoUrl: photoFor("STD-1005"), status: "Present" },
    ],
  },
  {
    id: "att3",
    className: "Form 1A",
    subject: "Kiswahili",
    date: "2026-08-06",
    takenAt: "2026-08-06T07:45:00.000Z",
    entries: [
      { studentId: "STD-2001", studentName: "Baraka Msigwa", photoUrl: photoFor("STD-2001"), status: "Present" },
      { studentId: "STD-2002", studentName: "Fatuma Ally", photoUrl: photoFor("STD-2002"), status: "Present" },
      { studentId: "STD-2003", studentName: "Hassan Kimaro", photoUrl: photoFor("STD-2003"), status: "Present" },
    ],
  },
];