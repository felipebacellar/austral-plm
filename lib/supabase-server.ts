import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { User } from "@supabase/supabase-js";

// Cliente com a service role key — só deve ser usado em código de servidor (rotas de API),
// nunca importado por um componente "use client".
export function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY não configurada.");
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

// Lê a sessão do usuário que fez a requisição, a partir dos cookies enviados pelo navegador.
async function getRequestUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll() { /* rotas de API não precisam renovar cookies de sessão */ },
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// role/permissions vivem em app_metadata: só a service role consegue escrever ali,
// diferente de user_metadata (que o próprio usuário logado pode editar via updateUser()).
export async function requireAdmin(): Promise<{ user: User | null; isAdmin: boolean }> {
  const user = await getRequestUser();
  if (!user) return { user: null, isAdmin: false };
  const isAdmin = user.app_metadata?.role === "admin";
  return { user, isAdmin };
}

export async function requireAuth(): Promise<User | null> {
  return getRequestUser();
}
