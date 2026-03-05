import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * POST: Parse PDF document and extract text
 * Requires: documentId, patientId, filePath
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

    // Check authorization: only admin can parse
    const admin = await isAdmin(supabase, user.id);
    if (!admin) {
      return NextResponse.json(
        { error: "Forbidden: Admin only" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { documentId, filePath } = body as {
      documentId?: string;
      filePath?: string;
    };

    if (!documentId || !filePath) {
      return NextResponse.json(
        { error: "Missing required fields: documentId, filePath" },
        { status: 400 }
      );
    }

    // SEGURANÇA: Protege contra Path Traversal
    // filePath deve conter apenas UUID/timestamp + nome de arquivo sem navegação de diretório
    if (
      filePath.includes("..") ||
      filePath.includes("//") ||
      filePath.startsWith("/") ||
      !/^[a-f0-9-]{36}\/[^/]+$/.test(filePath) // formato: {uuid}/{arquivo}
    ) {
      return NextResponse.json(
        { error: "Invalid file path." },
        { status: 400 }
      );
    }

    // Download file from Supabase Storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("patient-documents")
      .download(filePath);

    if (downloadError) {
      return NextResponse.json(
        { error: "Failed to download file" },
        { status: 400 }
      );
    }

    // Parse PDF content
    let parsedText = "";
    let success = false;

    try {
      // Dynamically import pdf-parse (Node.js only)
      const pdfParse = require("pdf-parse");

      const pdfData = await pdfParse(fileData);
      parsedText = pdfData.text;
      success = true;
    } catch (pdfError) {
      console.error("PDF parsing error:", pdfError);
      // Return partial success - file uploaded but not parsed
      return NextResponse.json(
        {
          documentId,
          parsed: false,
          message: "PDF upload succeeded but automatic parsing failed. Manual review recommended.",
        },
        { status: 200 }
      );
    }

    // Update document with parsed data
    const { data: document, error: updateError } = await supabase
      .from("documents")
      .update({
        parsed_data: {
          text: parsedText.substring(0, 5000), // Store first 5000 chars
          length: parsedText.length,
          parsed_at: new Date().toISOString(),
        },
      })
      .eq("id", documentId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to save parsed data" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      documentId,
      parsed: success,
      extractedLength: parsedText.length,
      document,
    });
  } catch (error) {
    console.error("Error parsing document:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
