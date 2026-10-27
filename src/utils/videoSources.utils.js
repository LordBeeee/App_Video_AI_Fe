const referenceTypeFor = (item, asset) => {
  const inputs = item.options?.referenceInputs
  if (!Array.isArray(inputs)) return null
  return inputs.find((input) =>
    (asset.id != null && input.assetId != null && Number(input.assetId) === Number(asset.id)) ||
    (asset.id != null && input.id === `${asset.type}_${asset.id}`) ||
    (asset.url && input.url === asset.url)
  )?.type || null
}

export function videoSourceGroups(item, inputs) {
  const groups = {
    frames: { label: 'Ảnh đầu/cuối', items: [] },
    images: { label: 'Ảnh tham chiếu', items: [] },
    videos: { label: 'Video tham chiếu', items: [] },
    elements: { label: 'Element', items: [] },
    audio: { label: 'Âm thanh tham chiếu', items: [] },
  }

  const referenceUrls = item.options?.referenceUrls
  const orderedInputs = Array.isArray(referenceUrls)
    ? [...inputs].sort((left, right) => {
        const leftIndex = referenceUrls.indexOf(left.url)
        const rightIndex = referenceUrls.indexOf(right.url)
        return (leftIndex < 0 ? Infinity : leftIndex) - (rightIndex < 0 ? Infinity : rightIndex)
      })
    : inputs

  orderedInputs.forEach((asset, index) => {
    const referenceType = referenceTypeFor(item, asset)
    if (asset.type === 'video') {
      groups.videos.items.push({ ...asset, label: referenceType === 'base_video' ? 'Video gốc' : 'Video tham chiếu' })
    } else if (asset.type === 'audio') {
      groups.audio.items.push({ ...asset, label: 'Âm thanh tham chiếu' })
    } else if (referenceType === 'first_frame' || referenceType === 'last_frame') {
      groups.frames.items.push({ ...asset, label: referenceType === 'first_frame' ? 'Ảnh đầu' : 'Ảnh cuối' })
    } else if (referenceType === 'refer_image' || referenceType === 'reference_image' ||
      item.options?.referenceMode === 'refer_image' || item.modelSlug === 'kling/kling-3.0-omni' ||
      item.options?.omniTaskType) {
      groups.images.items.push({ ...asset, label: 'Ảnh tham chiếu' })
    } else if (index < 2) {
      groups.frames.items.push({ ...asset, label: index === 0 ? 'Ảnh đầu' : 'Ảnh cuối' })
    } else {
      groups.images.items.push({ ...asset, label: 'Ảnh tham chiếu' })
    }
  })

  for (const asset of item.elementAssets || []) {
    groups.elements.items.push({ ...asset, label: asset.name || `Element #${asset.id}` })
  }

  return Object.values(groups).filter((group) => group.items.length > 0)
}
