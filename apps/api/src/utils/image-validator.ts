/**
 * Image inspection and validation utility using file signature (Magic Bytes).
 * Does not rely on file extension or client-reported MIME type.
 */

export interface ImageValidationResult {
  valid: boolean;
  format?: "jpeg" | "png" | "webp" | "gif";
  extension?: string;
  mimeType?: string;
  error?: string;
}

/**
 * Checks magic bytes against known image file signatures:
 * - JPEG: FF D8 FF
 * - PNG: 89 50 4E 47 0D 0A 1A 0A
 * - GIF: 47 49 46 38 (GIF87a or GIF89a)
 * - WEBP: 52 49 46 46 (RIFF) at offset 0 and 57 45 42 50 (WEBP) at offset 8
 */
export function inspectImageBuffer(buffer: Uint8Array): ImageValidationResult {
  if (!buffer || buffer.length < 12) {
    return {
      valid: false,
      error: "File is too small or empty to be a valid image",
    };
  }

  // 1. JPEG check: starts with FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return {
      valid: true,
      format: "jpeg",
      extension: "jpg",
      mimeType: "image/jpeg",
    };
  }

  // 2. PNG check: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return {
      valid: true,
      format: "png",
      extension: "png",
      mimeType: "image/png",
    };
  }

  // 3. GIF check: 'GIF87a' or 'GIF89a' (47 49 46 38 37 61 / 47 49 46 38 39 61)
  if (
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38 &&
    (buffer[4] === 0x37 || buffer[4] === 0x39) &&
    buffer[5] === 0x61
  ) {
    return {
      valid: true,
      format: "gif",
      extension: "gif",
      mimeType: "image/gif",
    };
  }

  // 4. WEBP check: starts with 'RIFF' (52 49 46 46) and offset 8 is 'WEBP' (57 45 42 50)
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return {
      valid: true,
      format: "webp",
      extension: "webp",
      mimeType: "image/webp",
    };
  }

  return {
    valid: false,
    error: "Invalid image file format. Only JPEG, PNG, WEBP, and GIF images are allowed based on file contents.",
  };
}

/**
 * Validates a File object and extracts its verified buffer & info
 */
export async function validateAndExtractImage(
  file: File,
  maxSizeBytes = 5 * 1024 * 1024 // default 5MB
): Promise<ImageValidationResult & { buffer?: Uint8Array }> {
  if (!file || typeof file.arrayBuffer !== "function") {
    return {
      valid: false,
      error: "No file provided or invalid file upload payload",
    };
  }

  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed limit of ${Math.round(maxSizeBytes / (1024 * 1024))}MB`,
    };
  }

  if (file.size < 12) {
    return {
      valid: false,
      error: "File is too small to be a valid image",
    };
  }

  const arrayBuf = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuf);
  const inspection = inspectImageBuffer(buffer);

  if (!inspection.valid) {
    return inspection;
  }

  return {
    ...inspection,
    buffer,
  };
}
