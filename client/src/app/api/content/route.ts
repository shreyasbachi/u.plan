import { extract } from "@extractus/article-extractor";
import { JSDOM } from "jsdom";

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    if (!url) {
      return new Response("Missing URL", { status: 400 });
    }

    const article = await extract(url);
    let text = article?.content || "";

    // Clean the text by removing HTML tags
    const dom = new JSDOM(text);
    text = dom.window.document.body.textContent || "";

    // Remove extra whitespace
    text = text.replace(/\s+/g, " ").trim();

    console.log("Cleaned Text: \n", text);

    const response = await fetch("http://localhost:8787/notes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
