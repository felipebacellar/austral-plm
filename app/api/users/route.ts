import { NextRequest, NextResponse } from "next/server";
import { adminClient, requireAdmin } from "@/lib/supabase-server";

// GET /api/users — lista todos os usuários (somente admin)
export async function GET() {
  const { user, isAdmin } = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  if (!isAdmin) return NextResponse.json({ error: "Acesso restrito a administradores." }, { status: 403 });

  try {
    const { data, error } = await adminClient().auth.admin.listUsers();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const users = (data.users || []).map(u => ({
      id: u.id,
      email: u.email,
      nome: u.user_metadata?.nome || "",
      role: u.app_metadata?.role || "user",
      permissions: u.app_metadata?.permissions || {},
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at || null,
    }));
    return NextResponse.json({ users });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST /api/users — cria novo usuário { email, password, nome } (somente admin)
export async function POST(req: NextRequest) {
  const { user, isAdmin } = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  if (!isAdmin) return NextResponse.json({ error: "Acesso restrito a administradores." }, { status: 403 });

  try {
    const { email, password, nome } = await req.json();
    if (!email || !password) return NextResponse.json({ error: "Email e senha são obrigatórios." }, { status: 400 });

    const { data, error } = await adminClient().auth.admin.createUser({
      email,
      password,
      user_metadata: { nome: nome || "" },
      app_metadata: { role: "user" },
      email_confirm: true,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ user: { id: data.user.id, email: data.user.email, nome } });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
