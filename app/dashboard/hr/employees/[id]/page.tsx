"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";

import { InfoCard, InfoRow } from "@/components/company-components/Inforow";
import Modal from "@/components/dashboard/Modal";
import EmployeeForm from "@/components/hr-components/Employeeform";
import { useEmployees } from "@/hooks/use-employees";
import type { EmployeeUpdateInput } from "@/lib/validations/employees-schema";

export default function EmployeeProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { employees, loading, error, updateEmployee } = useEmployees();
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const employee = employees.find((item) => item.id === id);

  const save = async (data: EmployeeUpdateInput) => {
    setSubmitting(true);
    const result = await updateEmployee(id, data);
    setSubmitting(false);
    if (result.success) setEditing(false);
  };

  if (loading)
    return (
      <p className="py-10 text-center text-sm text-slate-500">
        Loading employee…
      </p>
    );
  if (!employee)
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
        <p className="text-sm text-slate-500">
          {error ?? "Employee not found."}
        </p>
        <button
          type="button"
          onClick={() => router.push("/dashboard/hr/employees")}
          className="mt-3 text-sm font-medium text-indigo-600"
        >
          Back to Employee Management
        </button>
      </div>
    );

  const name = [employee.firstName, employee.middleName, employee.lastName]
    .filter(Boolean)
    .join(" ");
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <button
            type="button"
            onClick={() => router.push("/dashboard/hr/employees")}
            aria-label="Back to Employee Management"
            className="mt-2 text-slate-400 hover:text-slate-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-800">{name}</h1>
            <p className="text-sm text-slate-500">{employee.position}</p>
            <p className="mt-1 font-mono text-xs text-slate-400">
              {employee.employeeNumber}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <Pencil className="h-4 w-4" />
          Edit Employee
        </button>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <InfoCard title="Personal Information">
          <InfoRow
            icon={() => null}
            iconBg="bg-slate-100"
            iconColor="text-slate-600"
            label="Email"
            value={employee.email ?? ""}
          />
          <InfoRow
            icon={() => null}
            iconBg="bg-slate-100"
            iconColor="text-slate-600"
            label="Phone"
            value={employee.phone ?? ""}
          />
          <InfoRow
            icon={() => null}
            iconBg="bg-slate-100"
            iconColor="text-slate-600"
            label="Birthdate"
            value={employee.birthdate ?? ""}
          />
        </InfoCard>
        <InfoCard title="Employment Details">
          <InfoRow
            icon={() => null}
            iconBg="bg-slate-100"
            iconColor="text-slate-600"
            label="Department ID"
            value={employee.departmentId ?? ""}
          />
          <InfoRow
            icon={() => null}
            iconBg="bg-slate-100"
            iconColor="text-slate-600"
            label="Branch ID"
            value={employee.branchId ?? ""}
          />
          <InfoRow
            icon={() => null}
            iconBg="bg-slate-100"
            iconColor="text-slate-600"
            label="Salary"
            value={
              employee.salary === null
                ? ""
                : `TZS ${employee.salary.toLocaleString()}`
            }
          />
          <InfoRow
            icon={() => null}
            iconBg="bg-slate-100"
            iconColor="text-slate-600"
            label="Status"
            value={employee.status}
          />
        </InfoCard>
      </div>
      <Modal
        open={editing}
        onClose={() => !submitting && setEditing(false)}
        title="Edit Employee"
      >
        <EmployeeForm
          initialValue={employee}
          submitting={submitting}
          error={error}
          onSubmit={(data) => save(data as EmployeeUpdateInput)}
          onCancel={() => setEditing(false)}
        />
      </Modal>
    </div>
  );
}
