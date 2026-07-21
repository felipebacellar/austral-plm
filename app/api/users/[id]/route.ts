import { NextRequest, NextResponse } from "next/server";
import { adminClient, requireAdmin } from "@/lib/supabase-server";

// PATCH /api/users/[id] — atualiza nome, senha, role e/ou permissions (somente admin)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { user, isAdmin } = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  if (!isAdmin) return NextResponse.json({ error: "Acesso restrito a administradores." }, { status: 403 });

  try {
    const body = await req.json();
    const client = adminClient();

    // Busca metadata atual para mesclar em vez de substituir (a API do Supabase
    // trata user_metadata/app_metadata como substituição total, não merge parcial).
    const { data: current, error: fetchErr } = await client.auth.admin.getUserById(params.id);
    if (fetchErr || !current?.user) {
      return NextResponse.json({ error: fetchErr?.message || "Usuário não encontrado." }, { status: 404 });
    }

    const updates: Record<string, any> = {};

    if (body.nome !== undefined) {
      updates.user_metadata = { ...current.user.user_metadata, nome: body.nome };
    }

    if (body.role !== undefined || body.permissions !== undefined) {
      const appMeta = { ...current.user.app_metadata };
      if (body.role !== undefined) appMeta.role = body.role;
      if (body.permissions !== undefined) appMeta.permissions = body.permissions;
      updates.app_metadata = appMeta;
    }

    if (body.password !== undefined) updates.password = body.password;

    if (Object.keys(updates).length === 0) return NextResponse.json({ ok: true });

    const { error } = await client.auth.admin.updateUserById(params.id, updates);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// DELETE /api/users/[id] — remove usuário (somente admin)
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const { user, isAdmin } = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  if (!isAdmin) return NextResponse.json({ error: "Acesso restrito a administradores." }, { status: 403 });

  if (params.id === user.id) {
    return NextResponse.json({ error: "Você não pode excluir sua própria conta." }, { status: 400 });
  }

  try {
    const client = adminClient();

    // Impede apagar o último administrador restante, travando a gestão do sistema.
    const { data: target } = await client.auth.admin.getUserById(params.id);
    if (target?.user?.app_metadata?.role === "admin") {
      const { data: list, error: listErr } = await client.auth.admin.listUsers();
      if (listErr) return NextResponse.json({ error: listErr.message }, { status: 500 });
      const admins = (list.users || []).filter(u => u.app_metadata?.role === "admin");
      if (admins.length <= 1) {
        return NextResponse.json({ error: "Não é possível excluir o único administrador restante." }, { status: 400 });
      }
    }

    const { error } = await client.auth.admin.deleteUser(params.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
