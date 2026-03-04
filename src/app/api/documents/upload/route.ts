import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * POST: Upload document to Supabase Storage
 */

async function isAdmin(supabase: Awaited<ReturnType<typeof createClient>>, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  return data?.role === "admin";
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check authorization: only admin can upload
    const admin = await isAdmin(supabase, user.id);
    if (!admin) {
      return NextResponse.json(
        { error: "Forbidden: Admin only" },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const patientId = formData.get("patientId") as string;
    const fileType = formData.get("type") as string;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;

    if (!file || !patientId || !fileType || !title) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedMimes = ["application/pdf", "image/png", "image/jpeg", "image/webp"];
    if (!allowedMimes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: PDF, PNG, JPG, WebP" },
        { status: 400 }
      );
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size exceeds 10MB limit" },
        { status: 400 }
      );
    }

    // Convert file to ArrayBuffer
    const buffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);

    // Create file path: patient-documents/{patientId}/{timestamp}_{filename}
    const timestamp = Date.now();
    const filePath = `${patientId}/${timestamp}_${file.name}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("patient-documents")
      .upload(filePath, uint8Array, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload file" },
        { status: 400 }
      );
    }

    // Create document record in database
    const { data: document, error: dbError } = await supabase
      .from("documents")
      .insert({
        patient_id: patientId,
        uploaded_by: user.id,
        type: fileType,
        title,
        description,
        file_path: filePath,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
      })
      .select()
      .single();

    if (dbError) {
      // Try to delete the uploaded file if database insert fails
      await supabase.storage.from("patient-documents").remove([filePath]);

      return NextResponse.json(
        { error: "Failed to save document metadata" },
        { status: 400 }
      );
    }

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error("Error uploading document:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
