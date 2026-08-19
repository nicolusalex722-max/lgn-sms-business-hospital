"use client";

import { useEffect, useMemo, useState } from "react";

import type {
  CompanyUser,
  CompanyUserRole,
  Employee,
} from "@/lib/types";

import type {
  CompanyUserCreateInput,
  CompanyUserUpdateInput,
} from "@/lib/validations/company-users-schema";

/* -------------------------------------------------------------------------- */
/* Props                                                                      */
/* -------------------------------------------------------------------------- */

interface UserFormProps {
  initialValue?: CompanyUser | null;

  employees: Employee[];

  submitting?: boolean;

  error?: string | null;

  onSubmit: (
    data: CompanyUserCreateInput | CompanyUserUpdateInput,
  ) => void | Promise<void>;

  onCancel: () => void;
}

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const ROLE_OPTIONS: CompanyUserRole[] = ["User"];

const STATUS_OPTIONS = [
  "Active",
  "Inactive",
  "Suspended",
] as const;

type CompanyUserFormStatus = (typeof STATUS_OPTIONS)[number];

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function getEmployeeName(employee: Employee): string {
  return [
    employee.firstName,
    employee.middleName,
    employee.lastName,
  ]
    .filter(Boolean)
    .join(" ");
}

function getDisplayName(employee: Employee): string {
  return getEmployeeName(employee);
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function UserForm({
  initialValue = null,
  employees,
  submitting = false,
  error = null,
  onSubmit,
  onCancel,
}: UserFormProps) {
  const isEditing = Boolean(initialValue);

  /* ------------------------------------------------------------------------ */
  /* State                                                                    */
  /* ------------------------------------------------------------------------ */

  const [employeeId, setEmployeeId] = useState<string>(
    initialValue?.employeeId ?? "",
  );

  const [email, setEmail] = useState<string>(
    initialValue?.email ?? "",
  );

  const [phone, setPhone] = useState<string>(
    initialValue?.phone ?? "",
  );

  const [displayName, setDisplayName] = useState<string>(
    initialValue?.displayName ?? "",
  );

  const [password, setPassword] = useState<string>("");

  const [role, setRole] = useState<CompanyUserRole>(
    initialValue?.role ?? "User",
  );

  const [status, setStatus] = useState<CompanyUserFormStatus>(
    initialValue?.status ?? "Active",
  );

  const [localError, setLocalError] = useState<string | null>(null);

  /* ------------------------------------------------------------------------ */
  /* Selected Employee                                                        */
  /* ------------------------------------------------------------------------ */

  const selectedEmployee = useMemo(
    () =>
      employees.find(
        (employee) => employee.id === employeeId,
      ) ?? null,
    [employees, employeeId],
  );

  /* ------------------------------------------------------------------------ */
  /* Reset form when editing value changes                                    */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    setEmployeeId(initialValue?.employeeId ?? "");

    setEmail(initialValue?.email ?? "");

    setPhone(initialValue?.phone ?? "");

    setDisplayName(initialValue?.displayName ?? "");

    setPassword("");

    setRole(initialValue?.role ?? "User");

    setStatus(initialValue?.status ?? "Active");

    setLocalError(null);
  }, [initialValue]);

  /* ------------------------------------------------------------------------ */
  /* Employee Selection                                                       */
  /* ------------------------------------------------------------------------ */

  const handleEmployeeChange = (value: string) => {
    setEmployeeId(value);
    setLocalError(null);

    /*
     * Employee selection is mainly important when creating
     * a new CompanyUser account.
     *
     * The employee's existing profile information is used
     * to populate the account details.
     */
    if (!isEditing) {
      const employee = employees.find(
        (item) => item.id === value,
      );

      if (!employee) {
        setEmail("");
        setPhone("");
        setDisplayName("");
        return;
      }

      setEmail(employee.email ?? "");

      setPhone(employee.phone ?? "");

      setDisplayName(getDisplayName(employee));
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Submit                                                                   */
  /* ------------------------------------------------------------------------ */

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setLocalError(null);

    /* ---------------------------------------------------------------------- */
    /* Basic validation                                                       */
    /* ---------------------------------------------------------------------- */

    if (!employeeId.trim()) {
      setLocalError("Please select an employee.");
      return;
    }

    if (!displayName.trim()) {
      setLocalError("Display name is required.");
      return;
    }

    if (!email.trim()) {
      setLocalError("Email address is required.");
      return;
    }

    if (!phone.trim()) {
      setLocalError("Phone number is required.");
      return;
    }

    /* ---------------------------------------------------------------------- */
    /* Password validation                                                    */
    /* ---------------------------------------------------------------------- */

    if (!isEditing && !password.trim()) {
      setLocalError(
        "Password is required when creating a user.",
      );
      return;
    }

    if (!isEditing && password.length < 8) {
      setLocalError(
        "Password must contain at least 8 characters.",
      );
      return;
    }

    /* ---------------------------------------------------------------------- */
    /* Create                                                                 */
    /* ---------------------------------------------------------------------- */

    if (!isEditing) {
      const data: CompanyUserCreateInput = {
        employeeId: employeeId.trim(),
        email: email.trim(),
        phone: phone.trim(),
        displayName: displayName.trim(),
        role,
        password,
      };

      await onSubmit(data);

      return;
    }

    /* ---------------------------------------------------------------------- */
    /* Update                                                                 */
    /* ---------------------------------------------------------------------- */

    const data: CompanyUserUpdateInput = {
      email: email.trim(),
      phone: phone.trim(),
      displayName: displayName.trim(),
      role,
      status,
    };

    await onSubmit(data);
  };

  /* ------------------------------------------------------------------------ */
  /* Styles                                                                   */
  /* ------------------------------------------------------------------------ */

  const fieldClass =
    "w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm " +
    "focus:border-transparent focus:outline-none focus:ring-2 " +
    "focus:ring-indigo-500 disabled:cursor-not-allowed " +
    "disabled:bg-slate-100";

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5"
    >
      {/* ------------------------------------------------------------------ */}
      {/* Error                                                               */}
      {/* ------------------------------------------------------------------ */}

      {(localError || error) && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3">
          <p className="text-sm text-rose-600">
            {localError ?? error}
          </p>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Employee                                                             */}
      {/* ------------------------------------------------------------------ */}

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="employee"
          className="text-xs font-medium text-slate-500"
        >
          Employee{" "}
          <span className="text-rose-500">*</span>
        </label>

        <select
          id="employee"
          value={employeeId}
          onChange={(event) =>
            handleEmployeeChange(event.target.value)
          }
          disabled={submitting || isEditing}
          required
          className={`${fieldClass} bg-white`}
        >
          <option value="">Select employee</option>

          {employees.map((employee) => {
            const employeeName =
              getEmployeeName(employee);

            return (
              <option
                key={employee.id}
                value={employee.id}
              >
                {employeeName || employee.email || "Unnamed employee"}
                {employee.position
                  ? ` — ${employee.position}`
                  : ""}
              </option>
            );
          })}
        </select>

        <p className="text-xs text-slate-400">
          Select the employee who will use this login
          account.
        </p>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Selected Employee Information                                       */}
      {/* ------------------------------------------------------------------ */}

      {selectedEmployee && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs text-slate-400">
                Employee
              </p>

              <p className="mt-0.5 text-sm font-medium text-slate-700">
                {getEmployeeName(selectedEmployee)}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">
                Position
              </p>

              <p className="mt-0.5 text-sm font-medium text-slate-700">
                {selectedEmployee.position ||
                  "Not specified"}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">
                Phone
              </p>

              <p className="mt-0.5 text-sm font-medium text-slate-700">
                {selectedEmployee.phone ||
                  "Not specified"}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">
                Employee Email
              </p>

              <p className="mt-0.5 text-sm font-medium text-slate-700">
                {selectedEmployee.email ||
                  "Not specified"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Display Name                                                        */}
      {/* ------------------------------------------------------------------ */}

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="displayName"
          className="text-xs font-medium text-slate-500"
        >
          Display Name{" "}
          <span className="text-rose-500">*</span>
        </label>

        <input
          id="displayName"
          type="text"
          value={displayName}
          onChange={(event) =>
            setDisplayName(event.target.value)
          }
          placeholder="John Doe"
          required
          disabled={submitting}
          autoComplete="name"
          className={fieldClass}
        />

        <p className="text-xs text-slate-400">
          The name displayed throughout the application.
        </p>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Email + Phone                                                       */}
      {/* ------------------------------------------------------------------ */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="email"
            className="text-xs font-medium text-slate-500"
          >
            Login Email{" "}
            <span className="text-rose-500">*</span>
          </label>

          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            placeholder="employee@example.com"
            required
            disabled={submitting}
            autoComplete="email"
            className={fieldClass}
          />

          <p className="text-xs text-slate-400">
            This email is used to sign in.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="phone"
            className="text-xs font-medium text-slate-500"
          >
            Phone{" "}
            <span className="text-rose-500">*</span>
          </label>

          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(event) =>
              setPhone(event.target.value)
            }
            placeholder="+255..."
            required
            disabled={submitting}
            autoComplete="tel"
            className={fieldClass}
          />
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Role                                                                */}
      {/* ------------------------------------------------------------------ */}

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="role"
          className="text-xs font-medium text-slate-500"
        >
          Role{" "}
          <span className="text-rose-500">*</span>
        </label>

        <select
          id="role"
          value={role}
          onChange={(event) =>
            setRole(
              event.target.value as CompanyUserRole,
            )
          }
          disabled={submitting}
          required
          className={`${fieldClass} bg-white`}
        >
          {ROLE_OPTIONS.map((option) => (
            <option
              key={option}
              value={option}
            >
              {option}
            </option>
          ))}
        </select>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Password                                                             */}
      {/* ------------------------------------------------------------------ */}

      {!isEditing && (
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="password"
            className="text-xs font-medium text-slate-500"
          >
            Temporary Password{" "}
            <span className="text-rose-500">*</span>
          </label>

          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            placeholder="Minimum 8 characters"
            required
            minLength={8}
            disabled={submitting}
            autoComplete="new-password"
            className={fieldClass}
          />

          <p className="text-xs text-slate-400">
            Used only when creating the authentication
            account.
          </p>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Status                                                               */}
      {/* ------------------------------------------------------------------ */}

      {isEditing && (
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="status"
            className="text-xs font-medium text-slate-500"
          >
            Account Status
          </label>

          <select
            id="status"
            value={status}
            onChange={(event) =>
              setStatus(
                event.target
                  .value as CompanyUserFormStatus,
              )
            }
            disabled={submitting}
            className={`${fieldClass} bg-white`}
          >
            {STATUS_OPTIONS.map((option) => (
              <option
                key={option}
                value={option}
              >
                {option}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Actions                                                              */}
      {/* ------------------------------------------------------------------ */}

      <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting
            ? isEditing
              ? "Saving..."
              : "Creating..."
            : isEditing
              ? "Save Changes"
              : "Create User"}
        </button>
      </div>
    </form>
  );
}