
// Product

export type ProductType = "Business" | "Education" | "Hospital";

export type ProductStatus = "Active" | "Inactive";

export type Product = {
  id: string;
  name: string;
  type: ProductType;
  description: string;
  status: ProductStatus;
  created_at: string;
  updated_at: string;
};

export const PRODUCT_TYPES: ProductType[] = [
  "Business",
  "Education",
  "Hospital",
];

export const PRODUCT_STATUSES: ProductStatus[] = [
  "Active",
  "Inactive",
];

// Subscription Plans

export type SubscriptionStatus =
  | "Active"
  | "Trial"
  | "Expired"
  | "Cancelled";

export type BillingCycle =
  | "Monthly"
  | "Quarterly"
  | "Yearly";

export type Subscription = {
  id: string;
  plan: string;
  status: SubscriptionStatus;
  amount: number;
  billingCycle: BillingCycle;
  startDate: string; // ISO date
};

export const SUBSCRIPTION_STATUSES: SubscriptionStatus[] = [
  "Active",
  "Trial",
  "Expired",
  "Cancelled",
];

export const BILLING_CYCLES: BillingCycle[] = [
  "Monthly",
  "Quarterly",
  "Yearly",
];

// Companies

export type CompanyStatus = "Active" | "Inactive" | "Suspended";

export type Company = {
  id: string;
  companyName: string;
  displayName: string;
  email: string;
  phone: string | null;
  address: string | null;
  tin: string | null;
  registrationNumber: string | null;

  status: CompanyStatus;

  businessType: ProductType | null;
  subscriptionStatus: CompanySubscriptionStatus | null;

  createdAt: string;
  updatedAt: string;
};

export const COMPANY_STATUSES: CompanyStatus[] = [
  "Active",
  "Inactive",
  "Suspended",
];

// Company Subscriptions

export type CompanySubscriptionStatus =
  | "Trial"
  | "Active"
  | "Suspended"
  | "Expired"
  | "Cancelled";

export type CompanySubscription = {
  id: string;
  companyId: string;
  productId: string;
  subscriptionPlanId: string;
  status: CompanySubscriptionStatus;
  startDate: string; // ISO date
  endDate: string | null; // ISO date
  createdAt: string;
  updatedAt: string;
};

export const COMPANY_SUBSCRIPTION_STATUSES: CompanySubscriptionStatus[] = [
  "Trial",
  "Active",
  "Suspended",
  "Expired",
  "Cancelled",
];

// Departments

export type DepartmentStatus =
  | "Active"
  | "Inactive";


export const DEPARTMENT_STATUSES: DepartmentStatus[] = [
  "Active",
  "Inactive",
];


export type Department = {
  id: string;

  /**
   * Tenant/company that owns this department.
   *
   * This value is populated by the server from the
   * authenticated CompanyAdmin's company context.
   */
  companyId: string;

  departmentName: string;
  departmentCode: string;

  status: DepartmentStatus;

  description: string | null;

  createdAt: string;
  updatedAt: string;
};

////////////////////////////////////////////////////////////
// Branches
////////////////////////////////////////////////////////////

export type BranchStatus =
  | "Active"
  | "Inactive";


export const BRANCH_STATUSES: BranchStatus[] = [
  "Active",
  "Inactive",
];


export type Branch = {
  id: string;

  /**
   * Company that owns this branch.
   *
   * This is determined by the authenticated user's
   * company context and is never supplied by the UI.
   */
  companyId: string;

  branchName: string;
  branchCode: string;
  location: string | null;

  status: BranchStatus;

  createdAt: string;
  updatedAt: string;
};

// Authentication & Authorization

export type SystemRole =
  | "SuperAdmin"
  | "CompanyAdmin"
  | "User";

export const SYSTEM_ROLES: SystemRole[] = [
  "SuperAdmin",
  "CompanyAdmin",
  "User",
];


// Authenticated User

export type AuthenticatedUser = {
  id: string;
  email: string;
  role: SystemRole;
  companyId: string | null;
};


// Tenant Context

export type UserTenantContext = {
  userId: string;
  role: SystemRole;
  companyId: string | null;
};


// Company Admins

export type CompanyAdminStatus =
  | "Active"
  | "Inactive"
  | "Suspended";

export type CompanyAdmin = {
  id: string;
  authUserId: string;
  companyId: string;
  status: CompanyAdminStatus;
  createdAt: string;
  updatedAt: string;
};

export const COMPANY_ADMIN_STATUSES: CompanyAdminStatus[] = [
  "Active",
  "Inactive",
  "Suspended",
];


// Company Admin Creation

export type CompanyAdminCreateInput = {
  email: string;
  password: string;
};


// Company Users

export type CompanyUserRole = "User";

export type CompanyUserStatus =
  | "Active"
  | "Inactive"
  | "Suspended";

export type CompanyUser = {
  id: string;
  authUserId: string;
  companyId: string;
  username: string;
  email: string;
  role: CompanyUserRole;
  status: CompanyUserStatus;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
};

export const COMPANY_USER_ROLES: CompanyUserRole[] = [
  "User",
];

export const COMPANY_USER_STATUSES: CompanyUserStatus[] = [
  "Active",
  "Inactive",
  "Suspended",
];


// Company User Creation

export type CompanyUserCreateInput = {
  username: string;
  email: string;
  password: string;
  role: CompanyUserRole;
};


// Company + Admin Onboarding

export type CompanyWithAdminCreateInput = {
  company: {
    companyName: string;
    displayName: string;
    email: string;
    phone: string | null;
    address: string | null;
    tin: string | null;
    registrationNumber: string | null;
  };

  admin: CompanyAdminCreateInput;
};

//TRANSACTION
export type Transaction = {
  id: string;
  date: string;
  by: string;
  description: string;
  debit: number;
  credit: number;
};

export type AccountType = "Asset" | "Liability" | "Equity" | "Revenue" | "Expense";

export type Account = {
  code: string;
  name: string;
  type: AccountType;
  currency: string;
  description: string;
  transactions: Transaction[];
};

export const ACCOUNT_TYPES: AccountType[] = [
  "Asset",
  "Liability",
  "Equity",
  "Revenue",
  "Expense",
];

export type Book = {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  publisher: string;
  year: number;
  totalCopies: number;
  availableCopies: number;
};



export type RequestStatus = "Pending" | "Approved" | "Rejected";

export type BookRequest = {
  id: string;
  memberName: string;
  bookId: string;
  bookTitle: string;
  requestDate: string; // ISO date
  status: RequestStatus;
};

export type LoanStatus = "Active" | "Overdue" | "Returned";

export type Loan = {
  id: string;
  memberName: string;
  bookTitle: string;
  borrowDate: string; // ISO date
  dueDate: string; // ISO date
  returnDate: string | null;
  status: LoanStatus;
};

export type LibraryPolicy = {
  loanDurationDays: number;
  maxBooksPerMember: number;
  renewalLimit: number;
  lateFeePerDay: number;
};


//payment
export type PartyType = "Student" | "Supplier";

export type Party = {
  id: string;
  name: string;
  type: PartyType;
  /** Amount owed to the institution (student) or owed by the institution (supplier) */
  balance: number;
};

export type AccountPayment = {
  code: string;
  name: string;
};

export type PaymentMethod = "Mobile Money" | "Cash" | "Bank";

export type TransactionType = "Pay" | "Receive" | "Transfer";

export type TransactionPayment = {
  id: string;
  type: TransactionType;
  date: string; // ISO date
  amount: number;
  method: PaymentMethod | "Account Transfer";
  reference?: string;
  note?: string;
  // Present for Pay / Receive
  partyName?: string;
  partyType?: PartyType;
  // Present for Transfer
  fromAccount?: string;
  toAccount?: string;
};

//Expense
export type ExpenseCategory =
  | "Utilities"
  | "Rent"
  | "Salaries & Wages"
  | "Office Supplies"
  | "Maintenance & Repairs"
  | "Transport"
  | "Marketing"
  | "Professional Fees"
  | "Other";

export type PaymentMethodExpense = "Mobile Money" | "Cash" | "Bank";

export type AccountExpense = {
  code: string;
  name: string;
};

export type Expense = {
  id: string;
  date: string; // ISO date
  category: ExpenseCategory;
  vendor: string;
  amount: number;
  method: PaymentMethod;
  account: string; // account paid from
  reference?: string;
  description?: string;
};

//Billing & Invoice
export type DocType = "bill" | "invoice";

export type PartyRole = "Supplier" | "Customer";

export type LineItem = {
  id: string;
  description: string;
  qty: number;
  unitPrice: number;
  discount: number;
};

export type PaymentMethodBilling = "Mobile Money" | "Cash" | "Bank";

export type PaymentRecord = {
  id: string;
  date: string; // ISO date
  amount: number;
  method: PaymentMethod;
  reference?: string;
};

export type BillingDocument = {
  id: string;
  type: DocType;
  number: string; // e.g. BILL-000005 / INV-239778
  partyName: string;
  partyRole: PartyRole;
  partyPhone?: string;
  partyEmail?: string;
  date: string; // ISO issue date
  dueDate: string; // ISO due date
  items: LineItem[];
  taxRate: number; // percentage, e.g. 18 for 18% VAT
  payments: PaymentRecord[];
  voided?: boolean;
};

export type DocStatus = "Paid" | "Partially Paid" | "Not Paid" | "Void";

export type CompanyInfo = {
  name: string;
  branch: string;
  phone: string;
  email: string;
  address: string[];
  website: string;
};

//Budget Data
export type BudgetPeriodType = "Monthly" | "Quarterly" | "Yearly";

export type BudgetMovement = {
  id: string;
  date: string; // ISO date
  amount: number;
  note?: string;
};

export type Budget = {
  id: string;
  category: string;
  periodType: BudgetPeriodType;
  periodLabel: string; // e.g. "August 2026"
  startDate: string; // ISO date
  endDate: string; // ISO date
  allocated: number;
  movements: BudgetMovement[];
  notes?: string;
};

export type BudgetStatus = "On Track" | "Near Limit" | "Over Budget";


//Results
export type Grade = "A" | "B+" | "B" | "C" | "D" | "F";

export type Division = "I" | "II" | "III" | "IV" | "0";

export type ExamType = string;

export type StudentAttendance = {
  id: string;
  name: string;
  className: string;
};

export type SubjectResult = {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  examType: ExamType;
  subject: string;
  marks: number;
  grade: Grade;
};

export type StudentSummary = {
  studentId: string;
  studentName: string;
  className: string;
  examType: ExamType;
  subjects: SubjectResult[];
  totalPoints: number;
  division: Division;
};

//Attendance
export type AttendanceStatus = "Present" | "Absent";

export type Student = {
  id: string;
  name: string;
  className: string;
  /** Local path under /public, e.g. "/students/STD-1001.jpg". Optional — falls back to initials if missing. */
  photoUrl?: string;
};

export type AttendanceEntry = {
  studentId: string;
  studentName: string;
  photoUrl?: string;
  status: AttendanceStatus;
};

export type AttendanceRecord = {
  id: string;
  className: string;
  subject: string;
  date: string; // ISO date
  entries: AttendanceEntry[];
  takenAt: string; // ISO datetime
};