import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

// PATCH /api/users/[id] — atualiza nome, senha, role e/ou permissions
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const updates: Record<string, any> = {};
    const meta: Record<string, any> = {};
    if (body.nome !== undefined) meta.nome = body.nome;
    if (body.role !== undefined) meta.role = body.role;
    if (body.permissions !== undefined) meta.permissions = body.permissions;
    if (Object.keys(meta).length > 0) updates.user_metadata = meta;
    if (body.password !== undefined) updates.password = body.password;

    const { error } = await adminClient().auth.admin.updateUserById(params.id, updates);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// DELETE /api/users/[id] — remove usuário
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { error } = await adminClient().auth.admin.deleteUser(params.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
