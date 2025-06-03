// Contact Feedback API Route
// Accepts POST requests with feedback data, stores in Supabase, and sends email via Resend.
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Feedback } from "@/types/feedback";

export async function POST(req: NextRequest) {
  try {
    console.log("[Contact API] Incoming request");
    const body = await req.json();
    const { issueType, description, email, fileUrl } = body;
    console.log("[Contact API] Payload received:", {
      issueType,
      description,
      email,
      fileUrl,
    });
    if (!issueType || !description || !email) {
      console.warn("[Contact API] Missing required fields", {
        issueType,
        description,
        email,
      });
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    // Store in Supabase
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[Contact API] Inserting feedback into Supabase...");
    const { data, error } = await supabase
      .from("feedback")
      .insert([
        {
          issue_type: issueType,
          description,
          email,
          file_url: fileUrl || null,
        },
      ])
      .select()
      .single();
    if (error) {
      console.error("[Contact API] Supabase insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    console.log("[Contact API] Feedback stored in Supabase:", data);

    // Send email via Resend
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    if (!RESEND_API_KEY) {
      console.error("[Contact API] Resend API key not set.");
      return NextResponse.json(
        { error: "Resend API key not set." },
        { status: 500 }
      );
    }
    console.log("[Contact API] Sending email via Resend...");
    const mailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "noreply@aiflo.space",
        to: ["thoufic@achieveit.ai"],
        subject: `New Feedback: ${issueType}`,
        html: `<h2>New Feedback Received</h2>
          <p><b>Type:</b> ${issueType}</p>
          <p><b>Description:</b> ${description}</p>
          <p><b>Email:</b> ${email}</p>
          ${fileUrl ? `<p><b>Attachment:</b> <a href="${fileUrl}">${fileUrl}</a></p>` : ""}
          <p><b>Submitted at:</b> ${data.created_at}</p>`,
      }),
    });
    if (!mailRes.ok) {
      const mailErr = await mailRes.text();
      console.error(
        "[Contact API] Failed to send email notification:",
        mailErr
      );
      return NextResponse.json(
        { error: "Failed to send email notification." },
        { status: 500 }
      );
    }
    console.log("[Contact API] Email sent successfully via Resend.");

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[Contact API] Unexpected error:", err);
    return NextResponse.json(
      { error: err.message || "Unknown error." },
      { status: 500 }
    );
  }
}
