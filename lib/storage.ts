import { getSupabase } from "./supabase";

const BUCKET = "fichas-imagens";

export async function uploadImage(file: File, path: string): Promise<string | null> {
  const supabase = getSupabase();

  // Generate unique filename
  const ext = file.name.split(".").pop() || "jpg";
  const filename = `${path}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filename, file, { upsert: true });

  if (error) {
    console.error("Upload error:", error);
    return null;
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);
  return data.publicUrl;
}

export async function deleteImage(url: string): Promise<void> {
  const supabase = getSupabase();
  // Extract path from URL
  const parts = url.split(`${BUCKET}/`);
  if (parts.length < 2) return;
  const path = parts[1];
  await supabase.storage.from(BUCKET).remove([path]);
}
