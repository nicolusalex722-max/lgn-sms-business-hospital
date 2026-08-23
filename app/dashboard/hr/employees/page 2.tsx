// "use client";

// import { useEffect, useMemo, useState } from "react";
// import Link from "next/link";
// import { Plus, Search, SlidersHorizontal, Upload, Download } from "lucide-react";
// import EmployeeStatCards from "@/components/hr-components/Employeestatcards";
// import EmployeeTable, { Employee } from "@/components/hr-components/Employeetable";
// import EmployeeForm from "@/components/hr-components/Employeeform";
// import Modal from "@/components/dashboard/Modal";
// import FilterDropdown from "@/components/dashboard/Filterdropdown";
// import PaginationBar from "@/components/dashboard/Pegination";
// import { exportEmployeesToCsv } from "@/components/hr-components/Employeecsv";
// import { PENDING_IMPORT_KEY } from "@/components/hr-components/Employeeimporttemplate";

// const DEPARTMENT_OPTIONS = ["Collections", "Credit", "Customer Service", "Finance", "Human Resources", "Information Technology", "Operations"];

// const INITIAL_DATA: Employee[] = [
//   {
//     id: "emp-001",
//     firstName: "Asha",
//     middleName: "",
//     lastName: "Mwakalinga",
//     email: "asha@wari.com",
//     department: "Finance",
//     branch: "Head Office",
//     phone: "+255712345678",
//     salary: 1200000,
//     birthdate: "1992-04-12",
//     position: "Finance Manager",
//     nextOfKin: "James Mwakalinga",
//     guarantorPhone: "+255712000001",
//   },
//   {
//     id: "emp-002",
//     firstName: "John",
//     middleName: "David",
//     lastName: "Mushi",
//     email: "john@izackenterprises.com",
//     department: "Information Technology",
//     branch: "Head Office",
//     phone: "+255713111222",
//     salary: 1500000,
//     birthdate: "1990-09-03",
//     position: "IT Officer",
//     nextOfKin: "Grace Mushi",
//     guarantorPhone: "+255713000002",
//   },
//   {
//     id: "emp-003",
//     firstName: "Neema",
//     middleName: "",
//     lastName: "Kilonzo",
//     email: "neema@izackenterprises.com",
//     department: "Customer Service",
//     branch: "Mwanza Branch",
//     phone: "+255714222333",
//     salary: 850000,
//     birthdate: "1995-01-20",
//     position: "Customer Service Rep",
//     nextOfKin: "Peter Kilonzo",
//     guarantorPhone: "+255714000003",
//   },
// ];

// export default function EmployeesPage() {
//   const [employees, setEmployees] = useState<Employee[]>(INITIAL_DATA);
//   const [search, setSearch] = useState("");
//   const [departmentFilter, setDepartmentFilter] = useState("All");

//   const [formOpen, setFormOpen] = useState(false);
//   const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

//   // Pick up any batch import completed on the dedicated Import page
//   useEffect(() => {
//     const pending = sessionStorage.getItem(PENDING_IMPORT_KEY);
//     if (pending) {
//       try {
//         const parsed: Omit<Employee, "id">[] = JSON.parse(pending);
//         setEmployees((prev) => [...parsed.map((p) => ({ ...p, id: crypto.randomUUID() })), ...prev]);
//       } catch {
//         // ignore malformed data
//       } finally {
//         sessionStorage.removeItem(PENDING_IMPORT_KEY);
//       }
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const stats = useMemo(() => {
//     const totalEmployees = employees.length;
//     const departmentsInUse = new Set(employees.map((e) => e.department).filter(Boolean));
//     const annualSalary = employees.reduce((sum, e) => sum + e.salary * 12, 0);
//     return { totalEmployees, totalDepartments: departmentsInUse.size, annualSalary };
//   }, [employees]);

//   const filtered = useMemo(() => {
//     return employees.filter((emp) => {
//       const q = search.toLowerCase();
//       const fullName = `${emp.firstName} ${emp.middleName} ${emp.lastName}`.toLowerCase();
//       const matchesSearch = fullName.includes(q) || emp.email.toLowerCase().includes(q);
//       const matchesDept = departmentFilter === "All" || emp.department === departmentFilter;
//       return matchesSearch && matchesDept;
//     });
//   }, [employees, search, departmentFilter]);

//   const [page, setPage] = useState(1);
//   const [pageSize, setPageSize] = useState(10);
//   const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

//   useEffect(() => setPage(1), [search, departmentFilter, pageSize]);
//   useEffect(() => {
//     if (page > totalPages) setPage(totalPages);
//   }, [totalPages, page]);

//   const paginated = useMemo(() => {
//     const start = (page - 1) * pageSize;
//     return filtered.slice(start, start + pageSize);
//   }, [filtered, page, pageSize]);

//   const openAdd = () => {
//     setEditingEmployee(null);
//     setFormOpen(true);
//   };
//   const openEdit = (employee: Employee) => {
//     setEditingEmployee(employee);
//     setFormOpen(true);
//   };
//   const closeForm = () => {
//     setFormOpen(false);
//     setEditingEmployee(null);
//   };
//   const handleSubmit = (data: Omit<Employee, "id">) => {
//     if (editingEmployee) {
//       setEmployees((prev) => prev.map((e) => (e.id === editingEmployee.id ? { ...data, id: editingEmployee.id } : e)));
//     } else {
//       setEmployees((prev) => [{ ...data, id: crypto.randomUUID() }, ...prev]);
//     }
//     closeForm();
//   };

//   const handleExport = () => {
//     exportEmployeesToCsv(filtered);
//   };

//   return (
//     <div className="flex flex-col gap-6">
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//         <div>
//           <h1 className="text-2xl font-bold text-slate-800">Employee Management</h1>
//           <p className="text-sm text-slate-500 mt-1">Manage your organisation&apos;s employees</p>
//         </div>
//         <div className="flex items-center gap-2 flex-wrap">
//           <Link
//             href="/dashboard/hr/employee-import"
//             className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
//           >
//             <Upload className="w-4 h-4" />
//             Import
//           </Link>

//           <button
//             type="button"
//             onClick={handleExport}
//             className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
//           >
//             <Download className="w-4 h-4" />
//             Export
//           </button>

//           <button
//             type="button"
//             onClick={openAdd}
//             className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
//           >
//             <Plus className="w-4 h-4" />
//             Add Employee
//           </button>
//         </div>
//       </div>

//       {/* Summary cards */}
//       <EmployeeStatCards
//         totalEmployees={stats.totalEmployees}
//         totalDepartments={stats.totalDepartments}
//         annualSalary={stats.annualSalary}
//       />

//       {/* Search + filter */}
//       <div className="flex flex-col sm:flex-row gap-3">
//         <div className="relative flex-1">
//           <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
//           <input
//             type="text"
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             placeholder="Search by name or email..."
//             className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
//           />
//         </div>
//         <FilterDropdown
//           label="Department"
//           icon={SlidersHorizontal}
//           value={departmentFilter}
//           options={DEPARTMENT_OPTIONS}
//           allLabel="All Departments"
//           onChange={setDepartmentFilter}
//         />
//       </div>

//       {/* Table */}
//       <EmployeeTable employees={paginated} onEdit={openEdit} />

//       {/* Pagination */}
//       <PaginationBar
//         page={page}
//         totalPages={totalPages}
//         pageSize={pageSize}
//         totalCount={filtered.length}
//         itemLabel="employees"
//         onPageChange={setPage}
//         onPageSizeChange={setPageSize}
//       />

//       {/* Add / Edit modal */}
//       <Modal open={formOpen} onClose={closeForm} title={editingEmployee ? "Edit Employee" : "Add Employee"}>
//         <EmployeeForm initialValue={editingEmployee} onSubmit={handleSubmit} onCancel={closeForm} />
//       </Modal>
//     </div>
//   );
// }

"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search, SlidersHorizontal, Upload, Download } from "lucide-react";
import EmployeeStatCards from "@/components/hr-components/Employeestatcards";
import EmployeeTable, { Employee } from "@/components/hr-components/Employeetable";
import EmployeeForm from "@/components/hr-components/Employeeform";
import Modal from "@/components/dashboard/Modal";
import FilterDropdown from "@/components/dashboard/Filterdropdown";
import PaginationBar from "@/components/dashboard/Pegination";
import { exportEmployeesToCsv } from "@/components/hr-components/Employeecsv";
import { PENDING_IMPORT_KEY } from "@/components/hr-components/Employeeimporttemplate";
import { INITIAL_EMPLOYEES } from "@/components/hr-components/Employeedata";

const DEPARTMENT_OPTIONS = ["Collections", "Credit", "Customer Service", "Finance", "Human Resources", "Information Technology", "Operations"];


export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");

  const [formOpen, setFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Pick up any batch import completed on the dedicated Import page
  useEffect(() => {
    const pending = sessionStorage.getItem(PENDING_IMPORT_KEY);
    if (pending) {
      try {
        const parsed: Omit<Employee, "id">[] = JSON.parse(pending);
        setEmployees((prev) => [...parsed.map((p) => ({ ...p, id: crypto.randomUUID() })), ...prev]);
      } catch {
        // ignore malformed data
      } finally {
        sessionStorage.removeItem(PENDING_IMPORT_KEY);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = useMemo(() => {
    const totalEmployees = employees.length;
    const departmentsInUse = new Set(employees.map((e) => e.department).filter(Boolean));
    const annualSalary = employees.reduce((sum, e) => sum + e.salary * 12, 0);
    return { totalEmployees, totalDepartments: departmentsInUse.size, annualSalary };
  }, [employees]);

  const filtered = useMemo(() => {
    return employees.filter((emp) => {
      const q = search.toLowerCase();
      const fullName = `${emp.firstName} ${emp.middleName} ${emp.lastName}`.toLowerCase();
      const matchesSearch = fullName.includes(q) || emp.email.toLowerCase().includes(q);
      const matchesDept = departmentFilter === "All" || emp.department === departmentFilter;
      return matchesSearch && matchesDept;
    });
  }, [employees, search, departmentFilter]);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  useEffect(() => setPage(1), [search, departmentFilter, pageSize]);
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const openAdd = () => {
    setEditingEmployee(null);
    setFormOpen(true);
  };
  const openEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormOpen(true);
  };
  const closeForm = () => {
    setFormOpen(false);
    setEditingEmployee(null);
  };
  const handleSubmit = (data: Omit<Employee, "id">) => {
    if (editingEmployee) {
      setEmployees((prev) => prev.map((e) => (e.id === editingEmployee.id ? { ...data, id: editingEmployee.id } : e)));
    } else {
      setEmployees((prev) => [{ ...data, id: crypto.randomUUID() }, ...prev]);
    }
    closeForm();
  };

  const handleExport = () => {
    exportEmployeesToCsv(filtered);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Employee Management</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your organisation&apos;s employees</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/dashboard/company-profile/employees/import"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Import
          </Link>

          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>

          <button
            type="button"
            onClick={openAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Employee
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <EmployeeStatCards
        totalEmployees={stats.totalEmployees}
        totalDepartments={stats.totalDepartments}
        annualSalary={stats.annualSalary}
      />

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <FilterDropdown
          label="Department"
          icon={SlidersHorizontal}
          value={departmentFilter}
          options={DEPARTMENT_OPTIONS}
          allLabel="All Departments"
          onChange={setDepartmentFilter}
        />
      </div>

      {/* Table */}
      <EmployeeTable employees={paginated} onEdit={openEdit} />

      {/* Pagination */}
      <PaginationBar
        page={page}
        totalPages={totalPages}
        pageSize={pageSize}
        totalCount={filtered.length}
        itemLabel="employees"
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />

      {/* Add / Edit modal */}
      <Modal open={formOpen} onClose={closeForm} title={editingEmployee ? "Edit Employee" : "Add Employee"}>
        <EmployeeForm initialValue={editingEmployee} onSubmit={handleSubmit} onCancel={closeForm} />
      </Modal>
    </div>
  );
}