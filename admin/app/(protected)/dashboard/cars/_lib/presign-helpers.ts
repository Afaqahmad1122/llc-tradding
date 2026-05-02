import type { PresignCarImageBody } from "@/lib/api/cars";

/** Maps a dropped/selected image file to the presign request body accepted by `/cars/admin/images/presign`. */
export function mapFileToPresignParts(file: File): {
  body: PresignCarImageBody;
} | null {
  const name = file.name.toLowerCase();
  if (file.type === "image/jpeg" && /\.(jpe?g)$/i.test(name)) {
    return {
      body: {
        contentType: "image/jpeg",
        ext: name.endsWith(".jpeg") ? "jpeg" : "jpg",
      },
    };
  }
  if (file.type === "image/png" || name.endsWith(".png")) {
    return {
      body: { contentType: "image/png", ext: "png" },
    };
  }
  if (file.type === "image/webp" || name.endsWith(".webp")) {
    return {
      body: { contentType: "image/webp", ext: "webp" },
    };
  }
  return null;
}
