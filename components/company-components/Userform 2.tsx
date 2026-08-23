// "use client";

// import { useState } from "react";
// import type { AppUser } from "./Usertable";

// interface UserFormProps {
//   initialValue?: AppUser | null;
//   onSubmit: (data: Omit<AppUser, "id" | "lastLogin" | "emailVerified">) => void;
//   onCancel: () => void;
// }

// const ROLE_OPTIONS = ["Admin", "Seller", "Finance", "Manager"];

// export default function UserForm({ initialValue, onSubmit, onCancel }: UserFormProps) {
//   const [name, setName] = useState(initialValue?.name ?? "");
//   const [email, setEmail] = useState(initialValue?.email ?? "");
//   const [phone, setPhone] = useState(initialValue?.phone ?? "");
//   const [role, setRole] = useState(initialValue?.role ?? "Admin");
//   const [linkedEmployee, setLinkedEmployee] = useState(initialValue?.linkedEmployee ?? "");
//   const [disabled, setDisabled] = useState(initialValue ? initialValue.status === "Inactive" : false);

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!name.trim() || !email.trim()) return;

//     onSubmit({
//       name: name.trim(),
//       email: email.trim(),
//       phone: phone.trim(),
//       role,
//       linkedEmployee: linkedEmployee.trim(),
//       status: disabled ? "Inactive" : "Active",
//     });
//   };

//   const fieldClass =
//     "px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent";

//   return (
//     <form onSubmit={handleSubmit} className="flex flex-col gap-4">
//       <div className="flex flex-col gap-1">
//         <label className="text-xs font-medium text-slate-500">
//           Email {!initialValue && <span className="text-rose-500">*</span>}
//         </label>
//         <input
//           type="email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           placeholder="user@example.com"
//           required
//           autoFocus
//           className={fieldClass}
//         />
//       </div>

//       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//         <div className="flex flex-col gap-1">
//           <label className="text-xs font-medium text-slate-500">
//             Display Name {!initialValue && <span className="text-rose-500">*</span>}
//           </label>
//           <input
//             type="text"
//             value={name}
//             onChange={(e) => setName(e.target.value)}
//             placeholder="John Doe"
//             required
//             className={fieldClass}
//           />
//         </div>

//         <div className="flex flex-col gap-1">
//           <label className="text-xs font-medium text-slate-500">
//             Phone Number {!initialValue && <span className="text-rose-500">*</span>}
//           </label>
//           <input
//             type="tel"
//             value={phone}
//             onChange={(e) => setPhone(e.target.value)}
//             placeholder="+255 700 000 000"
//             required={!initialValue}
//             className={fieldClass}
//           />
//         </div>
//       </div>

//       <div className="flex flex-col gap-1">
//         <label className="text-xs font-medium text-slate-500">
//           Role {!initialValue && <span className="text-rose-500">*</span>}
//         </label>
//         <select value={role} onChange={(e) => setRole(e.target.value)} className={`${fieldClass} bg-white`}>
//           {ROLE_OPTIONS.map((r) => (
//             <option key={r} value={r}>
//               {r}
//             </option>
//           ))}
//         </select>
//       </div>

//       <div className="flex flex-col gap-1">
//         <label className="text-xs font-medium text-slate-500">
//           Link to Staff/Employee {!initialValue && <span className="text-rose-500">*</span>}
//         </label>
//         <input
//           type="text"
//           value={linkedEmployee}
//           onChange={(e) => setLinkedEmployee(e.target.value)}
//           placeholder="Search and select an employee"
//           className={fieldClass}
//         />
//         <p className="text-xs text-slate-400 mt-1">
//           {initialValue
//             ? "Link this user account to an employee record for task assignments."
//             : "Associate this user with an employee record for task assignments and branch scoping."}
//         </p>
//       </div>

//       {initialValue && (
//         <label className="flex items-center gap-2 cursor-pointer">
//           <input
//             type="checkbox"
//             checked={disabled}
//             onChange={(e) => setDisabled(e.target.checked)}
//             className="w-4 h-4 rounded accent-indigo-600 cursor-pointer"
//           />
//           <span className="text-sm text-slate-700">Disable this user</span>
//         </label>
//       )}

//       <div className="flex justify-end gap-2 pt-2">
//         <button
//           type="button"
//           onClick={onCancel}
//           className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
//         >
//           Cancel
//         </button>
//         <button
//           type="submit"
//           className="px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
//         >
//           {initialValue ? "Save Changes" : "Create User"}
//         </button>
//       </div>
//     </form>
//   );
// }