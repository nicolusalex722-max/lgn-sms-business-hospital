import { NextResponse } from "next/server";
import { getRolesForCompany, createRole } from "@/lib/actions/roles-actions";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const companyId = url.searchParams.get("companyId") ?? undefined;
    const roles = await getRolesForCompany(companyId || undefined);
    return NextResponse.json({ ok: true, data: roles });
  } catch (err: any) {
    console.error("GET /api/roles error:", err);
    return NextResponse.json({ ok: false, error: err?.message ?? "Failed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = body.name;
    const description = body.description ?? null;
    const companyId = body.companyId ?? undefined;

    if (!name || typeof name !== "string") {
      return NextResponse.json({ ok: false, error: "Role name is required." }, { status: 400 });
    }

    const role = await createRole(name.trim(), description, companyId);
    return NextResponse.json({ ok: true, data: role });
  } catch (err: any) {
    console.error("POST /api/roles error:", err);
    return NextResponse.json({ ok: false, error: err?.message ?? "Failed" }, { status: 500 });
  }
}
