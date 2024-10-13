import { NextResponse } from "next/server";
import pdf from "pdf-parse/lib/pdf-parse";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url } = body;

    const response = await fetch(url);
    const pdfBuffer = await response.arrayBuffer();

    const data = await pdf(Buffer.from(pdfBuffer));

    const extractedText = data.text;

    console.log("Extracted text length:", extractedText.length);
    console.log("First 100 characters:", extractedText.slice(0, 100));

    const aiCall = await fetch("http://localhost:8787/notes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: extractedText }),
    });

    if (!aiCall.ok) {
      const errorText = await aiCall.text();
      console.error(`AI API error (${aiCall.status}):`, errorText);
      throw new Error(`AI API error: ${aiCall.status} - ${errorText}`);
    }

    const result = await aiCall.json();
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error processing request in PDF handler:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
