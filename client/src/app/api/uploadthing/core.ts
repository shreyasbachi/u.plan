import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  pdfUploader: f({ pdf: { maxFileSize: "64MB" } }).onUploadComplete(
    async ({ file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log("Upload completed for the PDF file!");

      console.log("file url", file.url);

      return;
    }
  ),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
