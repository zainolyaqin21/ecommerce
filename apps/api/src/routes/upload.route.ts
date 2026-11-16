import { Elysia, t } from "elysia";
import { requireAdmin } from "../middlewares/auth.middleware";
import { validateAndExtractImage } from "../utils/image-validator";
import { join } from "path";
import { existsSync, mkdirSync } from "fs";
import { randomBytes } from "crypto";

// Ensure uploads folder exists
const uploadsDir = join(process.cwd(), "public", "uploads");
if (!existsSync(uploadsDir)) {
  mkdirSync(uploadsDir, { recursive: true });
}

export const uploadRoutes = new Elysia({ prefix: "/upload" })
  /**
   * POST /upload/image
   * Khusus Admin: Upload file gambar dengan verifikasi Magic Bytes / Signature file
   */
  .post(
    "/image",
    async ({ body, cookie: { sessionId }, headers, set }) => {
      const auth = await requireAdmin(sessionId.value, headers.authorization);
      if (!auth.isAdmin) {
        set.status = auth.status;
        return {
          success: false,
          error: auth.error,
        };
      }

      try {
        const file = body.file;
        const validation = await validateAndExtractImage(file);

        if (!validation.valid || !validation.buffer || !validation.extension) {
          set.status = 400;
          return {
            success: false,
            error: validation.error || "Invalid image file",
          };
        }

        // Generate safe unique filename
        const uniqueSuffix = `${Date.now()}-${randomBytes(8).toString("hex")}`;
        const fileName = `${uniqueSuffix}.${validation.extension}`;
        const targetPath = join(uploadsDir, fileName);

        await Bun.write(targetPath, validation.buffer);

        const url = `/public/uploads/${fileName}`;

        return {
          success: true,
          message: "Image uploaded and verified successfully",
          data: {
            url,
            format: validation.format,
            mimeType: validation.mimeType,
            size: file.size,
          },
        };
      } catch (err: any) {
        set.status = 500;
        return {
          success: false,
          error: err?.message || "Failed to process image upload",
        };
      }
    },
    {
      body: t.Object({
        file: t.File({
          description: "Image file to upload",
        }),
      }),
      detail: {
        tags: ["System"],
        summary: "Upload image with magic byte verification (Admin only)",
      },
    }
  );
