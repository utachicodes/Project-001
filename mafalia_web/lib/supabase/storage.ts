import { createClient } from "./client";
import { STORAGE_BUCKETS, DURATIONS } from '../constants';

const BUCKET = STORAGE_BUCKETS.UPLOADS;

export interface UploadedFile {
  name: string;
  url: string;
  size: number;
  path: string;
}

/** Uploads a file to Supabase storage and returns the public URL. */
export async function uploadFile(file: File, userId: string): Promise<UploadedFile> {
  const supabase = createClient();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${userId}/${Date.now()}_${safeName}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data: signed } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, DURATIONS.SIGNED_URL_SECONDS);

  return {
    name: file.name,
    url: signed?.signedUrl ?? "",
    size: file.size,
    path,
  };
}

/** Lists all files for a given user in the uploads bucket. */
export async function listUserFiles(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .list(userId, { limit: 100, sortBy: { column: "created_at", order: "desc" } });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export function getFileUrl(path: string): string {
  const supabase = createClient();
  const { data } = supabase.storage
    .from(STORAGE_BUCKETS.UPLOADS)
    .getPublicUrl(path);
  return data.publicUrl;
}

export async function listFiles(folder: string): Promise<{ data: unknown[] | null; error: Error | null }> {
  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKETS.UPLOADS)
    .list(folder);
  return { data, error };
}

export async function deleteFile(path: string): Promise<{ error: Error | null }> {
  const supabase = createClient();
  const { error } = await supabase.storage
    .from(STORAGE_BUCKETS.UPLOADS)
    .remove([path]);
  return { error };
}
