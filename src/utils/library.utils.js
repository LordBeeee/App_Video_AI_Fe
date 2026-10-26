export function formatFileSize(bytes) {
  const size = bytes == null || String(bytes).trim() === "" ? NaN : Number(bytes);
  if (!Number.isFinite(size) || size < 0) return "— MB";
  if (size > 0 && size < 10_000) return "< 0,01 MB";
  return `${(size / 1_000_000).toLocaleString("vi-VN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MB`;
}

export function mapAssetToItem(asset) {
  const isVideo = asset.assetType === "video";
  return {
    id: asset.id,
    type: asset.assetType,
    fileSizeBytes: asset.fileSizeBytes,
    category: asset.assetRole === "element" ? "element" : asset.assetRole === "voice" ? "voice" : asset.sourceType === "uploaded" ? "upload" : "creative",
    duration: asset.durationSeconds ? `${asset.durationSeconds}s` : undefined,
    favorite: !!asset.isFavorite,
    src: isVideo ? (asset.thumbnailUrl || asset.storedUrl) : asset.storedUrl,
    videoSrc: isVideo ? asset.storedUrl : undefined,
    alt: `${asset.assetType}_${asset.id}`,
    createdAt: asset.createdAt
      ? new Date(asset.createdAt).toLocaleString("vi-VN")
      : undefined,
    prompt: asset.prompt,
    model: asset.model,
    resolution: asset.resolution,
    displayPriceVnd: asset.priceVnd,
    options: { duration: asset.duration },
    startImages: asset.frames,
    name: asset.metadata?.name,
    description: asset.metadata?.description,
    sourceUrls: Array.isArray(asset.metadata?.sourceUrls) ? asset.metadata.sourceUrls : [],
    provider: asset.metadata?.provider,
    status: asset.metadata?.status,
    deleteStatus: asset.metadata?.deleteStatus,
    deleteError: asset.metadata?.deleteError,
    elementId: asset.metadata?.elementId,
    voiceId: asset.metadata?.voiceId,
    trialUrl: asset.metadata?.trialUrl,
    role: asset.assetRole,
    error: asset.metadata?.error,
  };
}
