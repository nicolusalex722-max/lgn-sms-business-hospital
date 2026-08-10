"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Pencil, User, Mail, Phone, Cake, Briefcase, Building2, MapPin, Wallet, UserCheck, PhoneCall } from "lucide-react";
import { getEmployeeById } from "@/components/hr-components/Employeedata";
import type { Employee } from "@/components/hr-components/Employeetable";
import EmployeeForm from "@/components/hr-components/Employeeform";
import { InfoRow, InfoCard } from "@/components/company-components/Inforow";
import Modal from "@/components/dashboard/Modal";

function formatCurrency(value: number) {
  return `TZS ${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function formatDate(value: string) {
  if (!value) return "\u2014";
  return new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
}

function initials(first: string, last: string) {
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();
}

export default function EmployeeProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [employee, setEmployee] = useState<Employee | undefined>(() => getEmployeeById(params.id));
  const [editOpen, setEditOpen] = useState(false);

  if (!employee) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
        <p className="text-sm text-slate-500">Employee not found.</p>
        <button
          type="button"
          onClick={() => router.push("/dashboard/company-profile/employees")}
          className="mt-3 text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          Back to Employee Management
        </button>
      </div>
    );
  }

  const handleSave = (data: Omit<Employee, "id">) => {
    // TODO: persist via your API/Prisma, e.g. PATCH /api/employees/[id]
    setEmployee({ ...data, id: employee.id });
    setEditOpen(false);
  };

  const fullName = `${employee.firstName} ${employee.middleName ? employee.middleName + " " : ""}${employee.lastName}`;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <button
            type="button"
            onClick={() => router.push("/dashboard/company-profile/employees")}
            aria-label="Back to Employee Management"
            className="mt-2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-lg font-bold shrink-0">
            {initials(employee.firstName, employee.lastName)}
          </div>

          <div>
            <h1 className="text-xl font-bold text-slate-800">{fullName}</h1>
            <p className="text-sm text-slate-500">{employee.position || "No position set"}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {employee.department && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                  {employee.department}
                </span>
              )}
              {employee.branch && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                  {employee.branch}
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setEditOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors shrink-0"
        >
          <Pencil className="w-4 h-4" />
          Edit Employee
        </button>
      </div>

      {/* Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <InfoCard title="Personal Information">
          <InfoRow icon={User} iconBg="bg-indigo-50" iconColor="text-indigo-600" label="Full Name" value={fullName} />
          <InfoRow icon={Mail} iconBg="bg-blue-50" iconColor="text-blue-600" label="Email" value={employee.email} />
          <InfoRow icon={Phone} iconBg="bg-sky-50" iconColor="text-sky-600" label="Phone" value={employee.phone} />
          <InfoRow icon={Cake} iconBg="bg-pink-50" iconColor="text-pink-600" label="Birthdate" value={formatDate(employee.birthdate)} />
        </InfoCard>

        <InfoCard title="Employment Details">
          <InfoRow icon={Briefcase} iconBg="bg-amber-50" iconColor="text-amber-600" label="Position" value={employee.position} />
          <InfoRow icon={Building2} iconBg="bg-indigo-50" iconColor="text-indigo-600" label="Department" value={employee.department || "Not assigned"} />
          <InfoRow icon={MapPin} iconBg="bg-teal-50" iconColor="text-teal-600" label="Branch" value={employee.branch || "Not assigned"} />
          <InfoRow icon={Wallet} iconBg="bg-emerald-50" iconColor="text-emerald-600" label="Salary" value={formatCurrency(employee.salary)} />
        </InfoCard>

        <InfoCard title="Emergency Contact">
          <InfoRow icon={UserCheck} iconBg="bg-purple-50" iconColor="text-purple-600" label="Next of Kin" value={employee.nextOfKin} />
          <InfoRow icon={PhoneCall} iconBg="bg-sky-50" iconColor="text-sky-600" label="Guarantor Phone" value={employee.guarantorPhone} />
        </InfoCard>
      </div>

      {/* Edit modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Employee">
        <EmployeeForm initialValue={employee} onSubmit={handleSave} onCancel={() => setEditOpen(false)} />
      </Modal>
    </div>
  );
}