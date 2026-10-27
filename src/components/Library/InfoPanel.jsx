import VideoSourceGroups from './VideoSourceGroups'
import { videoSourceGroups as buildVideoSourceGroups } from '../../utils/videoSources.utils'

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
  const sourceGroups = type === 'video' ? buildVideoSourceGroups(item, inputs) : []

  const inputCard = (asset, index) => {
    const label = asset.role === 'input' || index === 0 ? 'Bắt đầu' : 'Tham chiếu'
    return (
      <div key={`${asset.role}-${asset.id || asset.url}`} className="st-inp" title={label}>
        <div>
          {asset.type === 'video' ? (
            <video src={asset.url} poster={asset.thumbnailUrl || undefined} muted playsInline preload="metadata" />
          ) : asset.type === 'audio' ? (
            <span className="material-symbols-outlined">graphic_eq</span>
          ) : (
            <img src={asset.thumbnailUrl || asset.url} alt="" />
          )}
        </div>
        <span>{label}</span>
      </div>
    )
  }

  const inline = variant === 'inline'

  const copyButton = item.prompt && onCopyPrompt && (
    <button
      type="button"
      onClick={() => onCopyPrompt(item.prompt)}
      className={inline ? 'au-btn st-copy' : 'flex items-center gap-1.5 text-xs text-on-surface-variant transition hover:text-primary'}
    >
      <span className={`material-symbols-outlined ${inline ? '' : 'text-[17px]'}`} style={inline ? { fontSize: 16 } : undefined}>
        {promptCopied ? 'check' : 'content_copy'}
      </span>
      {promptCopied ? 'Đã sao chép' : 'Sao chép'}
    </button>
  )

  if (inline) {
    return (
      <div className="st-info">
        <div className="st-info-r">
          <div className="st-info-t au-fd">
            <span className="material-symbols-outlined">
              {type === 'video' ? 'movie' : type === 'audio' ? 'graphic_eq' : 'image'}
            </span>
            {type === 'video' ? 'Video' : type === 'audio' ? 'Audio' : 'Image'}
          </div>

          {type !== 'video' && inputs.map(inputCard)}

          {model && <span className="st-tg2">{model}</span>}
          {quality && <span className="st-tg2">{quality}</span>}
          {duration && <span className="st-tg2">{duration}s</span>}
          {price != null && <span className="st-tg2 ok">{formatMoney(price)}</span>}
          {copyButton}
        </div>

        {type === 'video' && <VideoSourceGroups groups={sourceGroups} />}

        {item.prompt && <p className="st-prompt au-scroll">{item.prompt}</p>}
      </div>
    )
  }

  const typeIcon = type === 'video' ? 'movie' : type === 'audio' ? 'graphic_eq' : 'image'
  const typeLabel = type === 'video' ? 'Video' : type === 'audio' ? 'Âm thanh' : 'Ảnh'

  return (
    <aside className="au-card lb-info">
      <header className="au-ch">
        <div className="au-chl">
          <span className="au-hic"><span className="material-symbols-outlined">{typeIcon}</span></span>
          <h3 className="au-h3 au-fd au-ell">{typeLabel}</h3>
        </div>
        {item.createdAt && <small className="lb-time">{item.createdAt}</small>}
      </header>

      <div className="au-scroll lb-info-b">
        {item.category === 'element' && item.description && <section><div className="lb-sh">Mô tả Element</div><p className="lb-pr">{item.description}</p></section>}
        {inputs.length > 0 && (
          <section>
            <div className="lb-sh"><span className="material-symbols-outlined">collections</span>Nguồn đầu vào</div>
            <div className="lb-ins">
              {inputs.map((asset) => (
                <div key={asset.id || asset.url}>
                  {asset.type === 'video' ? (
                    <video src={asset.url} muted />
                  ) : (
                    <img src={asset.thumbnailUrl || asset.url} alt="" />
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {item.prompt && (
          <section>
            <div className="lb-sh">
              <span className="material-symbols-outlined">notes</span>Prompt
              <span className="gap" />
              {onCopyPrompt && (
                <button
                  type="button"
                  onClick={() => onCopyPrompt(item.prompt)}
                  className="au-ico lb-cp"
                  aria-label="Sao chép prompt"
                  title={promptCopied ? 'Đã sao chép' : 'Sao chép prompt'}
                >
                  <span className="material-symbols-outlined">{promptCopied ? 'check' : 'content_copy'}</span>
                </button>
              )}
            </div>
            <p className="lb-pr">{item.prompt}</p>
          </section>
        )}

        {(model || quality || duration || price != null) && (
          <div className="lb-tgs">
            {model && <span className="lb-tg" title="Mô hình"><span className="material-symbols-outlined">memory</span>{model}</span>}
            {quality && <span className="lb-tg" title="Chất lượng"><span className="material-symbols-outlined">high_quality</span>{quality}</span>}
            {duration && <span className="lb-tg" title="Thời lượng"><span className="material-symbols-outlined">timer</span>{duration}s</span>}
            {price != null && <span className="lb-tg ok" title="Chi phí"><span className="material-symbols-outlined">payments</span>{formatMoney(price)}</span>}
          </div>
        )}
      </div>
    </aside>
  )
}
