import { supabase } from "@/integrations/supabase/client";

const BUCKET = "covers";
const TEN_YEARS = 60 * 60 * 24 * 365 * 10;

export const uploadCover = async (file: File) => {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw error;

  const { data, error: signError } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, TEN_YEARS);
  if (signError || !data?.signedUrl) throw signError ?? new Error("Falha ao gerar URL");

  return data.signedUrl;
};
