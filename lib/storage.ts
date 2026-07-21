import { getSupabase } from "./supabase";

const BUCKET = "fichas-imagens";
const MAX_SIDE = 1200; // px — boa qualidade para PDF, upload ~2x mais rápido
const QUALITY = 0.80;

function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const { naturalWidth: w, naturalHeight: h } = img;
      const scale = Math.min(1, MAX_SIDE / Math.max(w, h));
      const canvas = document.createElement("canvas");
      canvas.width  = Math.round(w * scale);
      canvas.height = Math.round(h * scale);
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => resolve(blob ?? file),
        "image/jpeg",
        QUALITY
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });
}

export async function uploadImage(file: File, path: string): Promise<string | null> {
  const supabase = getSupabase();

  const compressed = await compressImage(file);
  const ext = "jpg";
  const filename = `${path}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filename, compressed, { upsert: true, contentType: "image/jpeg" });

  if (error) {
    console.error("Upload error:", error);
    return null;
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);
  return data.publicUrl;
}

export async function deleteImage(url: string): Promise<string | null> {
  const supabase = getSupabase();
  const parts = url.split(`${BUCKET}/`);
  if (parts.length < 2) return null;
  const path = parts[1];
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) { console.error("deleteImage:", error); return error.message || "Erro ao remover imagem"; }
  return null;
}

// Remove todos os arquivos de uma "pasta" (prefixo) do bucket — usado ao excluir
// um produto inteiro, para não deixar fotos órfãs acumulando no armazenamento.
export async function deleteImagesByPrefix(prefix: string): Promise<void> {
  const supabase = getSupabase();
  const { data, error } = await supabase.storage.from(BUCKET).list(prefix);
  if (error) { console.error("deleteImagesByPrefix list:", error); return; }
  if (!data?.length) return;
  const paths = data.map(f => `${prefix}/${f.name}`);
  const { error: rmErr } = await supabase.storage.from(BUCKET).remove(paths);
  if (rmErr) console.error("deleteImagesByPrefix remove:", rmErr);
}
