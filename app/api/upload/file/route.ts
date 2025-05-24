// /api/upload/file/route.ts
// API endpoint for uploading files (images) to Supabase Storage with validation.
// Accepts multipart/form-data, validates and uploads images, and returns a public URL.

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { uploadImageToBucket } from "@/lib/supabase/uploadImageToBucket";
import { randomBytes } from "crypto";

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

    // Parse form data using Web API
    const formData = await req.formData();
    let type = formData.get("type");
    let file = formData.get("file") as File | null;
    let conversationId = formData.get("conversationId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (type === "image") {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        return NextResponse.json(
          { error: "Invalid image type" },
          { status: 400 }
        );
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: "Image too large (max 5MB)" },
          { status: 400 }
        );
      }
      // Read file as buffer
      const arrayBuffer = await file.arrayBuffer();
      const imageBuffer = Buffer.from(arrayBuffer);
      // Generate random filename
      conversationId = conversationId || "general";
      const randomId = randomBytes(8).toString("hex");
      // Preserve original extension if possible
      const ext = file.name.split(".").pop() || "jpg";
      const filePath = `c/${conversationId}/attachments/${randomId}.${ext}`;
      // Upload to Supabase
      const publicUrl = await uploadImageToBucket(imageBuffer, filePath);
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
