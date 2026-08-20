import { NextResponse } from "next/server";
import { getPermissions } from "@/lib/actions/roles-actions";

export async function GET() {
  try {
    const permissions = await getPermissions();
    return NextResponse.json({ ok: true, data: permissions });
  } catch (err: any) {
    console.error("GET /api/permissions error:", err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Failed" },
      { status: 500 },
    );
  }
}
