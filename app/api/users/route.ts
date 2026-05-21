import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY não configurada.");
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

// GET /api/users — lista todos os usuários
export async function GET() {
  try {
    const { data, error } = await adminClient().auth.admin.listUsers();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const users = (data.users || []).map(u => ({
      id: u.id,
      email: u.email,
      nome: u.user_metadata?.nome || "",
      role: u.user_metadata?.role || "user",
      permissions: u.user_metadata?.permissions || {},
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at || null,
    }));
    return NextResponse.json({ users });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST /api/users — cria novo usuário { email, password, nome }
export async function POST(req: NextRequest) {
  try {
    const { email, password, nome } = await req.json();
    if (!email || !password) return NextResponse.json({ error: "Email e senha são obrigatórios." }, { status: 400 });

    const { data, error } = await adminClient().auth.admin.createUser({
      email,
      password,
      user_metadata: { nome: nome || "" },
      email_confirm: true,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ user: { id: data.user.id, email: data.user.email, nome } });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
