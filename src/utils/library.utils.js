export function mapAssetToItem(asset) {
  const isVideo = asset.assetType === "video";
  return {
    id: asset.id,
    type: asset.assetType,
    category: asset.sourceType === "reference" ? "reference" : asset.sourceType === "uploaded" ? "upload" : "creative",
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
