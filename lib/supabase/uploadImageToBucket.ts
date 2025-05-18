/**
 * uploadImageToBucket
 * Helper to upload a base64 image to Supabase Storage at the path c/conversationid/{id}.webp
 * and return the public URL of the uploaded image.
 */
import { createClient } from "@/lib/supabase/server";
import { FileOptions } from "@supabase/storage-js";

/**
 * Uploads an image buffer to Supabase Storage and returns the public URL.
 * @param {Buffer} buffer - The image data as a Buffer
 * @param {string} filePath - The full path in the bucket where the image will be stored
 * @returns {Promise<string>} - The public URL of the uploaded image
 */
export async function uploadImageToBucket(
  buffer: Buffer,
  filePath: string,
  uploadOptions: FileOptions = {
    contentType: "image/webp",
    upsert: true,
  }
): Promise<string> {
  const supabase = await createClient(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const bucket = "c";

  // Upload the file
  const { error } = await supabase.storage
    .from(bucket)
    .upload(filePath, buffer, uploadOptions);
  if (error) throw new Error(`Supabase upload failed: ${error.message}`);

  // Get the public URL
  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  if (!data?.publicUrl)
    throw new Error(
      `Failed to get public URL for uploaded file at path '${filePath}' in bucket '${bucket}'`
    );
  return data.publicUrl;
}
