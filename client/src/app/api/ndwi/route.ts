import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET() {
  const filePath = path.join(
    process.cwd(),
    "public",
    "Desktop",
    "hub",
    "u-plan",
    "../../../../../server/output/ndwi_map_adjusted.html"
  );
  const htmlContent = await fs.readFile(filePath, "utf-8");

  return new NextResponse(htmlContent, {
    headers: { "Content-Type": "text/html" },
  });
}
