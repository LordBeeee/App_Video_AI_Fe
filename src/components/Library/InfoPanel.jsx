const formatMoney = (value) =>
  `${new Intl.NumberFormat('vi-VN').format(Number(value || 0))} ₫`

export default function InfoPanel({
  item,
  onCopyPrompt,
  promptCopied,
  variant = 'sidebar',
}) {
  const type = item.modality || item.type || 'image'
  const model = item.modelName || item.model || item.modelSlug
  const quality = item.displayQuality || item.resolution
  const duration = item.options?.duration || item.durationSeconds
  const price = item.displayPriceVnd ?? item.chargedVnd
  const inputs = item.inputAssets?.length
    ? item.inputAssets
    : (item.startImages || []).map((url, index) => ({
        id: `${index}-${url}`,
        role: index === 0 ? 'input' : 'reference',
        type: 'image',
        url,
      }))

  const copyButton = item.prompt && onCopyPrompt && (
    <button
      type="button"
      onClick={() => onCopyPrompt(item.prompt)}
      className="flex items-center gap-1.5 text-xs text-on-surface-variant transition hover:text-primary"
    >
      <span className="material-symbols-outlined text-[17px]">
        {promptCopied ? 'check' : 'content_copy'}
      </span>
      {promptCopied ? 'Đã sao chép' : 'Sao chép'}
    </button>
  )

  if (variant === 'inline') {
    return (
      <div className="mb-5 space-y-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="mr-1 flex items-center gap-2 text-base font-semibold text-on-surface">
            <span className="material-symbols-outlined text-xl text-primary">
              {type === 'video' ? 'movie' : type === 'audio' ? 'graphic_eq' : 'image'}
            </span>
            {type === 'video' ? 'Video' : type === 'audio' ? 'Audio' : 'Image'}
          </div>

          {inputs.map((asset, index) => (
            <div
              key={asset.id || asset.url}
              className="flex items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-low p-1.5 pr-3"
            >
              <div className="h-9 w-9 overflow-hidden rounded-md bg-black/40">
                {asset.type === 'video' ? (
                  <video src={asset.url} className="h-full w-full object-cover" muted />
                ) : (
                  <img src={asset.thumbnailUrl || asset.url} alt="" className="h-full w-full object-cover" />
                )}
              </div>
              <span className="text-xs font-medium text-on-surface">
                {asset.role === 'input' || index === 0 ? 'Bắt đầu' : 'Tham chiếu'}
              </span>
            </div>
          ))}

          {model && (
            <span className="rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 text-xs font-semibold text-on-surface">
              {model}
            </span>
          )}
          {quality && (
            <span className="rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 text-xs font-semibold text-on-surface">
              {quality}
            </span>
          )}
          {duration && (
            <span className="rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 text-xs font-semibold text-on-surface">
              {duration}s
            </span>
          )}
          {price != null && (
            <span className="rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs font-semibold text-emerald-300">
              {formatMoney(price)}
            </span>
          )}
          <div className="ml-auto">{copyButton}</div>
        </div>

        {item.prompt && (
          <p className="max-h-28 overflow-y-auto whitespace-pre-wrap pr-2 text-sm font-medium leading-7 text-on-surface custom-scrollbar">
            {item.prompt}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="flex w-96 shrink-0 flex-col gap-5 overflow-y-auto border-l border-outline-variant bg-white p-5 scrollbar-hide">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-on-surface">
          <span className="material-symbols-outlined text-[18px] text-primary">
            {type === 'video' ? 'movie' : type === 'audio' ? 'graphic_eq' : 'image'}
          </span>
          {type === 'video' ? 'Video' : type === 'audio' ? 'Audio' : 'Image'}
        </div>
      </div>

      {item.createdAt && <p className="-mt-3 text-xs text-slate-500">{item.createdAt}</p>}

      {inputs.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold text-on-surface">Nguồn đầu vào</h3>
          <div className="flex flex-wrap items-center gap-2">
            {inputs.map((asset) => (
              <div key={asset.id || asset.url} className="h-16 w-16 overflow-hidden rounded-lg border border-outline-variant bg-surface-variant">
                {asset.type === 'video' ? (
                  <video src={asset.url} className="h-full w-full object-cover" muted />
                ) : (
                  <img src={asset.thumbnailUrl || asset.url} alt="" className="h-full w-full object-cover" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {item.prompt && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-on-surface">Prompt</h3>
            {copyButton}
          </div>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-on-surface-variant">{item.prompt}</p>
        </div>
      )}

      {(model || quality || duration || price != null) && (
        <div className="flex flex-wrap items-center gap-2">
          {model && <span className="rounded-md border border-outline-variant bg-surface-variant px-2 py-1 text-xs text-on-surface-variant">{model}</span>}
          {quality && <span className="rounded-md border border-outline-variant bg-surface-variant px-2 py-1 text-xs text-on-surface-variant">{quality}</span>}
          {duration && <span className="rounded-md border border-outline-variant bg-surface-variant px-2 py-1 text-xs text-on-surface-variant">{duration}s</span>}
          {price != null && <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-xs text-emerald-300">{formatMoney(price)}</span>}
        </div>
      )}
    </div>
  )
}
