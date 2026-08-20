import { NextResponse } from "next/server";

import {
  getRoleById,
  updateRole,
  deleteRole,
} from "@/lib/actions/roles-actions";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  _req: Request,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    const role = await getRoleById(id);

    return NextResponse.json({
      ok: true,
      data: role,
    });
  } catch (err: unknown) {
    console.error("GET /api/roles/:id error:", err);

    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Failed",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    const body = await req.json();

    const updates = {
      name: body.name,
      description: body.description ?? null,
      status: body.status ?? undefined,
    };

    const updated = await updateRole(id, updates);

    return NextResponse.json({
      ok: true,
      data: updated,
    });
  } catch (err: unknown) {
    console.error("PUT /api/roles/:id error:", err);

    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Failed",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    await deleteRole(id);

    return NextResponse.json({
      ok: true,
    });
  } catch (err: unknown) {
    console.error("DELETE /api/roles/:id error:", err);

    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Failed",
      },
      { status: 500 }
    );
  }
}