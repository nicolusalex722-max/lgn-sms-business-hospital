import type { Division, Grade, Student, StudentSummary, SubjectResult } from "./types";

/**
 * Marks → grade boundaries. Adjust to match your school's official scale.
 */
export function computeGrade(marks: number): Grade {
  if (marks >= 75) return "A";
  if (marks >= 65) return "B+";
  if (marks >= 45) return "B";
  if (marks >= 30) return "C";
  if (marks >= 20) return "D";
  return "F";
}

/**
 * Grade point weighting, as specified: A=1, B+=2, B=3, C=4, D=5.
 * F=6 is included as the standard next step in this scale — adjust if your
 * school does not award points for a fail.
 */
export const GRADE_POINTS: Record<Grade, number> = {
  A: 1,
  "B+": 2,
  B: 3,
  C: 4,
  D: 5,
  F: 6,
};

/**
 * Division boundaries follow the standard best-7-subjects NECTA CSEE scale.
 * If a student has a different subject count, the thresholds may need
 * scaling — this implementation sums points across ALL subjects entered.
 */
export function computeDivision(totalPoints: number, subjectCount: number): Division {
  if (subjectCount === 0) return "0";
  if (totalPoints <= 17) return "I";
  if (totalPoints <= 21) return "II";
  if (totalPoints <= 25) return "III";
  if (totalPoints <= 33) return "IV";
  return "0";
}

export function buildStudentSummaries(
  results: SubjectResult[],
  students: Student[],
  className: string,
  examType: string
): StudentSummary[] {
  const scoped = results.filter((r) => r.className === className && r.examType === examType);
  const byStudent = new Map<string, SubjectResult[]>();
  for (const r of scoped) {
    const list = byStudent.get(r.studentId) ?? [];
    list.push(r);
    byStudent.set(r.studentId, list);
  }

  const summaries: StudentSummary[] = [];
  for (const [studentId, subjects] of byStudent.entries()) {
    const totalPoints = subjects.reduce((sum, s) => sum + GRADE_POINTS[s.grade], 0);
    const studentName = subjects[0]?.studentName ?? students.find((s) => s.id === studentId)?.name ?? studentId;
    summaries.push({
      studentId,
      studentName,
      className,
      examType,
      subjects: subjects.sort((a, b) => a.subject.localeCompare(b.subject)),
      totalPoints,
      division: computeDivision(totalPoints, subjects.length),
    });
  }
  return summaries;
}