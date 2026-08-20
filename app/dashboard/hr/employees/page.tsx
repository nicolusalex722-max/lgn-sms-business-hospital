"use client";

import { useMemo, useState } from "react";
import { Download, Plus, Search, SlidersHorizontal } from "lucide-react";

import EmployeeForm from "@/components/hr-components/Employeeform";
import { exportEmployeesToCsv } from "@/components/hr-components/Employeecsv";
import EmployeeStatCards from "@/components/hr-components/Employeestatcards";
import EmployeeTable from "@/components/hr-components/Employeetable";
import FilterDropdown from "@/components/dashboard/Filterdropdown";
import Modal from "@/components/dashboard/Modal";
import PaginationBar from "@/components/dashboard/Pegination";
import { useEmployees } from "@/hooks/use-employees";
import type { Employee } from "@/lib/types";
import type {
  EmployeeCreateInput,
  EmployeeUpdateInput,
} from "@/lib/validations/employees-schema";

export default function EmployeesPage() {
  const {
    employees,
    loading,
    error,
    fetchEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
  } = useEmployees();
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [formOpen, setFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const departmentOptions = useMemo(
    () => [
      ...new Set(
        employees
          .map((employee) => employee.departmentId)
          .filter((id): id is string => Boolean(id)),
      ),
    ],
    [employees],
  );
  const stats = useMemo(
    () => ({
      totalEmployees: employees.length,
      totalDepartments: departmentOptions.length,
      annualSalary: employees.reduce(
        (total, employee) => total + (employee.salary ?? 0) * 12,
        0,
      ),
    }),
    [departmentOptions.length, employees],
  );
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return employees.filter((employee) => {
      const fullName = [
        employee.firstName,
        employee.middleName,
        employee.lastName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const matchesSearch =
        !query ||
        fullName.includes(query) ||
        employee.employeeNumber.toLowerCase().includes(query) ||
        employee.email?.toLowerCase().includes(query);
      return (
        matchesSearch &&
        (departmentFilter === "All" ||
          employee.departmentId === departmentFilter)
      );
    });
  }, [departmentFilter, employees, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginated = useMemo(
    () => filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [currentPage, filtered, pageSize],
  );
  const closeForm = () => {
    if (!submitting) {
      setFormOpen(false);
      setEditingEmployee(null);
    }
  };

  const handleSubmit = async (
    data: EmployeeCreateInput | EmployeeUpdateInput,
  ) => {
    setSubmitting(true);
    const result = editingEmployee
      ? await updateEmployee(editingEmployee.id, data as EmployeeUpdateInput)
      : await createEmployee(data as EmployeeCreateInput);
    setSubmitting(false);
    if (result.success) {
      setFormOpen(false);
      setEditingEmployee(null);
    }
  };

  const handleDelete = async (employee: Employee) => {
    const name = [employee.firstName, employee.lastName].join(" ");
    if (window.confirm(`Delete ${name}? This cannot be undone.`))
      await deleteEmployee(employee.id);
  };

  if (loading)
    return (
      <p className="py-10 text-center text-sm text-slate-500">
        Loading employees…
      </p>
    );
  if (!employees.length && error)
    return (
      <div className="py-10 text-center">
        <p className="text-sm text-rose-600">{error}</p>
        <button
          type="button"
          onClick={() => void fetchEmployees()}
          className="mt-4 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Try again
        </button>
      </div>
    );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Employee Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your organisation&apos;s employees
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => exportEmployeesToCsv(filtered)}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
          <button
            type="button"
            onClick={() => {
              setEditingEmployee(null);
              setFormOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Add Employee
          </button>
        </div>
      </div>
      <EmployeeStatCards
        totalEmployees={stats.totalEmployees}
        totalDepartments={stats.totalDepartments}
        annualSalary={stats.annualSalary}
      />
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search by name, employee number, or email..."
            className="w-full rounded-lg border border-slate-300 py-2.5 pl-11 pr-4 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <FilterDropdown
          label="Department"
          icon={SlidersHorizontal}
          value={departmentFilter}
          options={departmentOptions}
          allLabel="All Departments"
          onChange={(value) => {
            setDepartmentFilter(value);
            setPage(1);
          }}
        />
      </div>
      {error && <p className="text-sm text-rose-600">{error}</p>}
      <EmployeeTable
        employees={paginated}
        onEdit={(employee) => {
          setEditingEmployee(employee);
          setFormOpen(true);
        }}
        onDelete={handleDelete}
      />
      <PaginationBar
        page={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalCount={filtered.length}
        itemLabel="employees"
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
      />
      <Modal
        open={formOpen}
        onClose={closeForm}
        title={editingEmployee ? "Edit Employee" : "Add Employee"}
      >
        <EmployeeForm
          initialValue={editingEmployee}
          submitting={submitting}
          error={error}
          onSubmit={handleSubmit}
          onCancel={closeForm}
        />
      </Modal>
    </div>
  );
}
