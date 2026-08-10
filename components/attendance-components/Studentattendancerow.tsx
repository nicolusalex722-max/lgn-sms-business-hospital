import type { AttendanceStatus, Student } from "@/lib/types";
import StudentAvatar from "./Studentavatar";

export default function StudentAttendanceRow({
  student,
  status,
  onChange,
}: {
  student: Student;
  status: AttendanceStatus;
  onChange: (status: AttendanceStatus) => void;
}) {
  return (
    <div className="flex items-center gap-4 px-4 py-3">
      <StudentAvatar src={student.photoUrl} name={student.name} size={40} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-800">{student.name}</p>
        <p className="text-xs text-slate-400">{student.id}</p>
      </div>

      <div className="flex shrink-0 items-center gap-4">
        <label className="flex cursor-pointer items-center gap-1.5">
          <input
            type="radio"
            name={`attendance-${student.id}`}
            value="Present"
            checked={status === "Present"}
            onChange={() => onChange("Present")}
            className="peer sr-only"
          />
          <span className="flex h-4 w-4 items-center justify-center rounded-full border-2 border-slate-300 transition peer-checked:border-emerald-500 peer-checked:bg-emerald-500">
            {status === "Present" && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
          </span>
          <span className={`text-sm font-medium ${status === "Present" ? "text-emerald-600" : "text-slate-500"}`}>
            Present
          </span>
        </label>

        <label className="flex cursor-pointer items-center gap-1.5">
          <input
            type="radio"
            name={`attendance-${student.id}`}
            value="Absent"
            checked={status === "Absent"}
            onChange={() => onChange("Absent")}
            className="peer sr-only"
          />
          <span className="flex h-4 w-4 items-center justify-center rounded-full border-2 border-slate-300 transition peer-checked:border-rose-500 peer-checked:bg-rose-500">
            {status === "Absent" && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
          </span>
          <span className={`text-sm font-medium ${status === "Absent" ? "text-rose-600" : "text-slate-500"}`}>
            Absent
          </span>
        </label>
      </div>
    </div>
  );
}