import { NextResponse } from "next/server";
import { getRoleById, updateRole, deleteRole } from "@/lib/actions/roles-actions";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const role = await getRoleById(params.id);
    return NextResponse.json({ ok: true, data: role });
  } catch (err: any) {
    console.error("GET /api/roles/:id error:", err);
    return NextResponse.json({ ok: false, error: err?.message ?? "Failed" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const updates = {
      name: body.name,
      description: body.description ?? null,
      status: body.status ?? undefined,
    };
    const updated = await updateRole(params.id, updates);
    return NextResponse.json({ ok: true, data: updated });
  } catch (err: any) {
    console.error("PUT /api/roles/:id error:", err);
    return NextResponse.json({ ok: false, error: err?.message ?? "Failed" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await deleteRole(params.id);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("DELETE /api/roles/:id error:", err);
    return NextResponse.json({ ok: false, error: err?.message ?? "Failed" }, { status: 500 });
  }
}
