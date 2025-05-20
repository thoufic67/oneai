// /api/upload/file/route.ts
// API endpoint for uploading files (images) to Supabase Storage with compression and validation.
// Accepts multipart/form-data, compresses images to webp, and returns a public URL.

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { uploadImageToBucket } from "@/lib/supabase/uploadImageToBucket";
import formidable from "formidable";
import sharp from "sharp";
import { randomBytes } from "crypto";
import { unlink } from "fs/promises";

export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper to parse multipart form data
async function parseForm(
  req: Request
): Promise<{ fields: formidable.Fields; files: formidable.Files }> {
  const form = formidable({ multiples: false });
  // Explicitly type callback params as 'any' to satisfy linter and formidable's callback signature
  return new Promise((resolve, reject) => {
    form.parse(req as any, (err: any, fields: any, files: any) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
}

export async function POST(req: Request) {
  try {
    // Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse form data
    const form = formidable({ multiples: false, maxFileSize: 5 * 1024 * 1024 }); // 5MB max
    // Explicitly type callback params as 'any' to satisfy linter and formidable's callback signature
    const { fields, files } = await new Promise<{
      fields: formidable.Fields;
      files: formidable.Files;
    }>((resolve, reject) => {
      form.parse(req as any, (err: any, fields: any, files: any) => {
        if (err) return reject(err);
        resolve({ fields, files });
      });
    });

    // Safely extract 'type' and 'file' (formidable may return arrays or undefined)
    let type = fields.type;
    if (Array.isArray(type)) type = type[0];
    if (typeof type !== "string") type = "";
    type = type as string;
    let file = files.file;
    if (Array.isArray(file)) file = file[0];
    if (!file) file = undefined;
    file = file as unknown as formidable.File;
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (type === "image") {
      // Validate file type
      if (!file.mimetype?.startsWith("image/")) {
        return NextResponse.json(
          { error: "Invalid image type" },
          { status: 400 }
        );
      }
      // Validate file size (max 5MB before compression)
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: "Image too large (max 5MB)" },
          { status: 400 }
        );
      }
      // Compress to webp and ensure ≤ 200kb
      const imageBuffer = await sharp(file.filepath)
        .webp({ quality: 80 })
        .resize({ width: 1024, withoutEnlargement: true })
        .toBuffer();
      if (imageBuffer.length > 200 * 1024) {
        return NextResponse.json(
          { error: "Compressed image exceeds 200kb" },
          { status: 400 }
        );
      }
      // Generate random filename
      let conversationId = fields.conversationId;
      if (Array.isArray(conversationId)) conversationId = conversationId[0];
      if (typeof conversationId !== "string") conversationId = "";
      conversationId = conversationId || "general";
      const randomId = randomBytes(8).toString("hex");
      const filePath = `c/${conversationId}/attachments/${randomId}.webp`;
      // Upload to Supabase
      const publicUrl = await uploadImageToBucket(imageBuffer, filePath);
      // Clean up temp file
      await unlink(file.filepath);
      return NextResponse.json({
        attachment_type: "image",
        attachment_url: publicUrl,
        filePath,
        size: imageBuffer.length,
      });
    } else {
      return NextResponse.json({ error: "Unsupported type" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
