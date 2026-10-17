/**
 * Utility functions for artwork URL resolution and high quality image promotion.
 */

/**
 * Upgrades a JioSaavn / Saavn CDN image URL to 500x500 resolution.
 * Preserves custom collage URLs (e.g. pli.saavncdn.com) and local file:// paths.
 */
export function forceHighQualityImageUrl(
  url?: string | null,
): string | undefined {
  if (!url || typeof url !== "string") return undefined;

  const trimmed = url.trim();
  if (!trimmed) return undefined;

  // Local file paths
  if (trimmed.startsWith("file://") || trimmed.startsWith("/")) {
    return trimmed.startsWith("file://") ? trimmed : `file://${trimmed}`;
  }

  // Ensure HTTPS
  let result = trimmed.replace(/^http:\/\//i, "https://");

  // Upgrade 50x50 or 150x150 to 500x500 for Saavn CDN images (supports .webp, .jpg, .png, etc.)
  return trimmed
    .replace(/^http:\/\//i, "https://")
    .replace(
      /(?:-|_)((?:50|150)x(?:50|150))(?=\.[a-z0-9]+|\?|$)/gi,
      "-500x500",
    );
}

/**
 * Resolves the highest resolution artwork URL available for a given track or song object.
 */
export function getHighQualityArtwork(item: any): string | undefined {
  if (!item) return undefined;

  const song = item?.extraPayload?.song || item;

  // 1. Check local downloaded artwork path
  const local = item?.localArtworkPath || song?.localArtworkPath;
  if (local && typeof local === "string" && local.trim().length > 0) {
    return local.startsWith("file://") ? local : `file://${local}`;
  }

  // 2. Check image array on song or item
  const images = song?.image || item?.image;
  let candidate: string | undefined = undefined;

  if (Array.isArray(images) && images.length > 0) {
    // Look specifically for 500x500 entry first
    const q500 = images.find(
      (img: any) =>
        (typeof img === "object" && img?.quality === "500x500") ||
        (typeof img === "string" && img.includes("500x500")),
    );

    if (q500) {
      candidate = typeof q500 === "string" ? q500 : q500?.url;
    } else {
      // Pick the last item (conventionally highest quality)
      const last = images[images.length - 1];
      candidate = typeof last === "string" ? last : last?.url;
    }
  } else if (typeof images === "string" && images.trim().length > 0) {
    candidate = images;
  }

  // 3. Check track.artwork or song.artwork
  if (!candidate) {
    const art = item?.artwork || song?.artwork || song?.cover || item?.cover;
    if (typeof art === "string" && art.trim().length > 0) {
      candidate = art;
    }
  }

  // 4. Force high quality 500x500 resolution
  return forceHighQualityImageUrl(candidate);
}
