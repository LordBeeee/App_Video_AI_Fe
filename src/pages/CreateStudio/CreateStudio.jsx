import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import InfoPanel from '../../components/Library/InfoPanel'
import { uploadAssetApi } from '../../services/asset.service'
import {
  createGeneration,
  createPriceQuote,
  getAiCatalog,
  getGeneration,
  getGenerations,
} from '../../services/aiPlatform.service'

const MODALITIES = [
  { id: 'image', label: 'Image', icon: 'image' },
  { id: 'video', label: 'Video', icon: 'smart_display' },
  { id: 'audio', label: 'Audio', icon: 'graphic_eq' },
  { id: 'chat', label: 'Chat', icon: 'chat_bubble' },
]

const money = (value) => `${new Intl.NumberFormat('vi-VN').format(Number(value || 0))} ₫`

function values(capabilities, key, fallback = []) {
  const value = capabilities?.[key]
  if (Array.isArray(value)) return value
  if (Array.isArray(value?.values)) return value.values
  return fallback
}

function FieldSelect({ label, value, onChange, options }) {
  if (!options?.length) return null
  return (
    <label className="space-y-2 text-sm text-slate-400">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-white/10 bg-[#22262d] px-3 py-3 text-sm font-medium text-white outline-none focus:border-white/30">
        {options.map((option) => <option key={String(option)} value={option}>{String(option)}</option>)}
      </select>
    </label>
  )
}

export default function CreateStudio() {
  const { modality: routeModality = 'image' } = useParams()
  const navigate = useNavigate()
  const modality = ['image', 'video', 'audio'].includes(routeModality) ? routeModality : 'image'
  const [models, setModels] = useState([])
  const [selectedModel, setSelectedModel] = useState('')
  const [prompt, setPrompt] = useState('')
  const [options, setOptions] = useState({ n: 1, speed: 1, maxOutputTokens: 1024 })
  const [quote, setQuote] = useState(null)
  const [quoteError, setQuoteError] = useState('')
  const [references, setReferences] = useState([])
  const [uploading, setUploading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState([])
  const [error, setError] = useState('')
  const [promptCopied, setPromptCopied] = useState(false)
  const quoteSequence = useRef(0)

  const model = useMemo(() => models.find((item) => item.id === selectedModel), [models, selectedModel])
  const capabilities = model?.capabilities || {}

  const loadHistory = useCallback(async () => {
    try { setHistory((await getGenerations(modality)).items || []) } catch { setHistory([]) }
  }, [modality])

  useEffect(() => {
    let active = true
    setModels([])
    setSelectedModel('')
    setQuote(null)
    setResult(null)
    setReferences([])
    getAiCatalog(modality).then((items) => {
      if (!active) return
      setModels(items)
      if (items[0]) setSelectedModel(items[0].id)
    }).catch((err) => setError(err.response?.data?.message || err.message))
    loadHistory()
    return () => { active = false }
  }, [modality, loadHistory])

  useEffect(() => {
    if (!model) return
    if (modality === 'image') {
      const ratios = values(capabilities, 'aspect_ratio', ['1:1'])
      const resolutions = values(capabilities, 'resolution', [])
      setOptions({
        n: 1,
        aspectRatio: ratios[0] || '1:1',
        resolution: resolutions[0] || '',
        quality: values(capabilities, 'quality', ['auto'])[0] || 'auto',
        outputFormat: 'png',
      })
    }
    if (modality === 'video') {
      setOptions({
        resolution: capabilities.resolutions?.[0] || '',
        aspectRatio: capabilities.aspectRatios?.[0] || '',
        duration: capabilities.durations?.[0] || 5,
        generateAudio: !!capabilities.generateAudio,
      })
    }
    if (modality === 'audio') {
      setOptions({ voice: model.voices?.[0] || '', speed: 1 })
    }
  }, [model, modality, capabilities])

  useEffect(() => {
    setQuote(null)
    setQuoteError('')
    if (!selectedModel || !prompt.trim()) return
    const sequence = ++quoteSequence.current
    const timer = setTimeout(async () => {
      try {
        const next = await createPriceQuote({ modality, modelSlug: selectedModel, prompt, options })
        if (sequence === quoteSequence.current) setQuote(next)
      } catch (err) {
        if (sequence === quoteSequence.current) {
          setQuoteError(err.response?.data?.message || err.message)
          setQuote(null)
        }
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [modality, selectedModel, prompt, options])

  const setOption = (key, value) => setOptions((current) => ({ ...current, [key]: value }))

  const uploadReference = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const asset = await uploadAssetApi(file)
      setReferences((current) => [
        ...current,
        { id: Number(asset.id), url: asset.storedUrl, type: asset.assetType },
      ].slice(-2))
    } catch (err) {
      setError(err.message || 'Upload thất bại')
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  const copyPrompt = async (text) => {
    await navigator.clipboard.writeText(text)
    setPromptCopied(true)
    setTimeout(() => setPromptCopied(false), 1500)
  }

  const pollVideo = async (id) => {
    for (let attempt = 0; attempt < 120; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 5000))
      const current = await getGeneration(id)
      setResult(current)
      if (['succeeded', 'failed'].includes(current.status)) return current
    }
    throw new Error('Video vẫn đang xử lý. Bạn có thể xem lại trong lịch sử.')
  }

  const generate = async () => {
    if (!quote || generating) return
    setGenerating(true)
    setError('')
    try {
      let created = await createGeneration({
        quoteId: quote.quoteId,
        prompt,
        referenceUrls: references.map((item) => item.url),
        referenceAssetIds: references.map((item) => item.id),
      })
      setResult(created)
      setQuote(null)
      if (modality === 'video' && !['succeeded', 'failed'].includes(created.status)) {
        created = await pollVideo(created.id)
      }
      await loadHistory()
    } catch (err) {
      const detail = err.response?.data?.message
      setError(typeof detail === 'object' ? detail.message : detail || err.message)
    } finally {
      setGenerating(false)
    }
  }

  const renderOptions = () => {
    if (modality === 'image') return (
      <div className="grid grid-cols-2 gap-3">
        <FieldSelect label="Tỷ lệ" value={options.aspectRatio || ''} onChange={(v) => setOption('aspectRatio', v)}
          options={values(capabilities, 'aspect_ratio', ['1:1', '16:9', '9:16', '4:3', '3:4'])} />
        <FieldSelect label="Độ phân giải" value={options.resolution || ''} onChange={(v) => setOption('resolution', v)}
          options={values(capabilities, 'resolution')} />
        <FieldSelect label="Chất lượng" value={options.quality || 'auto'} onChange={(v) => setOption('quality', v)}
          options={values(capabilities, 'quality', ['auto', 'low', 'medium', 'high'])} />
        <FieldSelect label="Số lượng" value={options.n || 1} onChange={(v) => setOption('n', Number(v))} options={[1, 2, 3, 4]} />
      </div>
    )
    if (modality === 'video') return (
      <div className="grid grid-cols-2 gap-3">
        <FieldSelect label="Tỷ lệ" value={options.aspectRatio || ''} onChange={(v) => setOption('aspectRatio', v)} options={capabilities.aspectRatios || []} />
        <FieldSelect label="Độ phân giải" value={options.resolution || ''} onChange={(v) => setOption('resolution', v)} options={capabilities.resolutions || []} />
        <FieldSelect label="Thời lượng" value={options.duration || ''} onChange={(v) => setOption('duration', Number(v))} options={capabilities.durations || []} />
        {capabilities.generateAudio && (
          <label className="flex items-end">
            <button type="button" onClick={() => setOption('generateAudio', !options.generateAudio)}
              className={`w-full rounded-xl border px-3 py-3 text-sm ${options.generateAudio ? 'border-cyan-400 bg-cyan-400/10 text-cyan-300' : 'border-white/10 bg-[#22262d] text-slate-400'}`}>
              <span className="material-symbols-outlined mr-2 align-middle text-lg">volume_up</span>
              Có âm thanh
            </button>
          </label>
        )}
      </div>
    )
    return (
      <div className="grid grid-cols-2 gap-3">
        <FieldSelect label="Giọng đọc" value={options.voice || ''} onChange={(v) => setOption('voice', v)} options={model?.voices || []} />
        <FieldSelect label="Tốc độ" value={options.speed || 1} onChange={(v) => setOption('speed', Number(v))} options={[0.75, 1, 1.25, 1.5]} />
      </div>
    )
  }

  return (
    <div className="flex h-screen min-w-0 overflow-hidden bg-[#111418] text-white">
      <section className="flex w-full shrink-0 flex-col border-r border-white/10 bg-[#14171b] lg:w-[480px]">
        <div className="flex gap-2 border-b border-white/10 px-5 py-4">
          {MODALITIES.map((item) => (
            item.id === 'chat' ? (
              <button key={item.id} onClick={() => navigate('/chat')} className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-slate-400 hover:bg-white/5 hover:text-white">
                <span className="material-symbols-outlined text-lg">{item.icon}</span>{item.label}
              </button>
            ) : (
              <Link key={item.id} to={`/create/${item.id}`} className={`flex items-center gap-2 rounded-xl px-4 py-2.5 ${modality === item.id ? 'bg-[#2a2e34] text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                <span className="material-symbols-outlined text-lg">{item.icon}</span>{item.label}
              </Link>
            )
          ))}
        </div>

        <div className="custom-scrollbar flex-1 space-y-4 overflow-y-auto p-5">
          <div className="rounded-2xl border border-white/10 bg-[#181b20] p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Model</p>
            <select value={selectedModel} onChange={(event) => setSelectedModel(event.target.value)}
              className="w-full bg-transparent text-base font-semibold text-white outline-none">
              {models.map((item) => <option key={item.id} value={item.id} className="bg-[#181b20]">{item.name}</option>)}
            </select>
            {model?.description && <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">{model.description}</p>}
          </div>

          {modality !== 'audio' && (
            <div className="rounded-2xl border border-white/10 bg-[#181b20] p-4">
              <p className="mb-3 text-sm font-semibold">Ảnh tham chiếu <span className="font-normal text-slate-500">(tùy chọn)</span></p>
              <div className="flex gap-3">
                {references.map((reference, index) => (
                  <button key={reference.id} type="button" onClick={() => setReferences((items) => items.filter((_, i) => i !== index))}
                    className="group relative h-24 w-24 overflow-hidden rounded-xl border border-white/10">
                    {reference.type === 'video'
                      ? <video src={reference.url} className="h-full w-full object-cover" muted />
                      : <img src={reference.url} className="h-full w-full object-cover" alt="Reference" />}
                    <span className="absolute inset-0 hidden items-center justify-center bg-black/60 group-hover:flex">Xóa</span>
                  </button>
                ))}
                {references.length < 2 && (
                  <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/20 bg-white/[0.03] text-slate-400 hover:border-white/40 hover:text-white">
                    <span className="material-symbols-outlined">add_photo_alternate</span>
                    <span className="mt-1 text-xs">{uploading ? 'Đang tải' : 'Tải ảnh'}</span>
                    <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={uploadReference} />
                  </label>
                )}
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-white/10 bg-[#181b20] p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold">{modality === 'audio' ? 'Kịch bản' : 'Prompt'}</p>
              <span className="text-xs text-slate-600">{prompt.length}</span>
            </div>
            <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} rows={8}
              placeholder={modality === 'audio' ? 'Nhập nội dung bạn muốn chuyển thành giọng nói...' : 'Mô tả nội dung bạn muốn tạo...'}
              className="w-full resize-none bg-transparent text-sm leading-6 text-white outline-none placeholder:text-slate-600" />
          </div>

          {renderOptions()}
          {error && <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}
          {quoteError && <p className="text-xs text-amber-300">{quoteError}</p>}
          {result && (
            <div className="rounded-2xl border border-white/10 bg-[#181b20] p-4 lg:hidden">
              <div className="mb-3 flex items-center justify-between"><p className="font-semibold">Kết quả gần nhất</p><span className="text-xs text-slate-500">{result.status}</span></div>
              {result.outputUrls?.length > 0 && (
                <InfoPanel
                  item={result}
                  variant="inline"
                  onCopyPrompt={copyPrompt}
                  promptCopied={promptCopied}
                />
              )}
              {!result.outputUrls?.length && <p className={result.status === 'failed' ? 'text-sm text-red-300' : 'text-sm text-slate-400'}>{result.errorMessage || 'Nội dung đang được xử lý…'}</p>}
              {result.outputUrls?.map((url) => (
                <div key={url} className="mb-3 overflow-hidden rounded-xl bg-black/30">
                  {modality === 'image' && <img src={url} className="max-h-80 w-full object-contain" alt="Generated" />}
                  {modality === 'video' && <video src={url} controls className="max-h-80 w-full" />}
                  {modality === 'audio' && <audio src={url} controls className="w-full p-3" />}
                  <a href={url} target="_blank" rel="noreferrer" className="block border-t border-white/10 px-3 py-2 text-center text-xs text-cyan-300">Mở hoặc tải xuống</a>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-white/10 bg-[#14171b] p-5">
          <button type="button" disabled={!quote || generating} onClick={generate}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-4 font-semibold text-black transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-slate-500">
            {generating ? 'Đang xử lý...' : `Tạo ${modality === 'image' ? 'ảnh' : modality === 'video' ? 'video' : 'audio'}`}
            {quote && <><span className="text-lg">✦</span><span>{money(quote.maxPriceVnd)}</span></>}
          </button>
          {quote && quote.minPriceVnd !== quote.maxPriceVnd && <p className="mt-2 text-center text-xs text-slate-500">Ước tính {money(quote.minPriceVnd)} – {money(quote.maxPriceVnd)}</p>}
        </div>
      </section>

      <section className="relative hidden min-w-0 flex-1 flex-col items-center justify-center overflow-hidden bg-[#111418] px-8 lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(56,189,248,0.09),transparent_45%)]" />
        <div className="relative z-10 flex w-full max-w-4xl flex-col items-center">
          {!result && (
            <div className="text-center">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.04]">
                <span className="material-symbols-outlined text-4xl text-cyan-300">{MODALITIES.find((item) => item.id === modality)?.icon}</span>
              </div>
              <h2 className="text-2xl font-semibold">Sẵn sàng sáng tạo</h2>
              <p className="mt-2 text-sm text-slate-500">Chọn model, nhập prompt và xem giá trước khi tạo.</p>
            </div>
          )}
          {result && !result.outputUrls?.length && (
            <div className="text-center">
              <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-2 border-white/10 border-t-cyan-300" />
              <h2 className="text-xl font-semibold">{result.status === 'failed' ? 'Tạo nội dung thất bại' : 'OpenRouter đang xử lý...'}</h2>
              <p className={`mt-2 text-sm ${result.status === 'failed' ? 'text-red-300' : 'text-slate-500'}`}>{result.errorMessage || 'Video thường mất vài phút để hoàn tất.'}</p>
            </div>
          )}
          {result?.outputUrls?.length > 0 && (
            <div className="w-full">
              <InfoPanel
                item={result}
                variant="inline"
                onCopyPrompt={copyPrompt}
                promptCopied={promptCopied}
              />
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/30 shadow-2xl">
                {modality === 'image' && <div className="grid gap-2 sm:grid-cols-2">{result.outputUrls.map((url) => <img key={url} src={url} className="max-h-[64vh] w-full object-contain" alt="Generated" />)}</div>}
                {modality === 'video' && <video src={result.outputUrls[0]} controls className="max-h-[64vh] w-full" />}
                {modality === 'audio' && <div className="p-12"><audio src={result.outputUrls[0]} controls autoPlay className="w-full" /></div>}
              </div>
              <div className="mt-5 flex items-center justify-between text-sm text-slate-400">
                <span>Đã lưu vào Thư viện</span>
                <div className="flex items-center gap-4">
                  <a href={result.outputUrls[0]} target="_blank" rel="noreferrer" className="text-cyan-300 hover:text-cyan-200">Tải xuống</a>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <aside className="hidden w-72 shrink-0 border-l border-white/10 bg-[#14171b] p-4 xl:block">
        <div className="mb-4 flex items-center justify-between"><h3 className="font-semibold">Gần đây</h3><button onClick={loadHistory} className="text-slate-500 hover:text-white"><span className="material-symbols-outlined text-lg">refresh</span></button></div>
        <div className="custom-scrollbar space-y-3 overflow-y-auto">
          {history.map((item) => (
            <button key={item.id} onClick={() => setResult(item)}
              className={`flex w-full gap-3 rounded-xl border p-2 text-left transition ${result?.id === item.id ? 'border-cyan-400/60 bg-cyan-400/10' : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'}`}>
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-black/40">
                {item.thumbnailUrl
                  ? <img src={item.thumbnailUrl} alt="" className="h-full w-full object-cover" />
                  : <span className="material-symbols-outlined flex h-full items-center justify-center text-slate-600">smart_display</span>}
                <span className={`absolute right-1 top-1 h-2.5 w-2.5 rounded-full border border-black/50 ${item.status === 'succeeded' ? 'bg-emerald-400' : item.status === 'failed' ? 'bg-red-400' : 'animate-pulse bg-amber-400'}`} />
              </div>
              <div className="min-w-0 flex-1 py-1">
                <p className="line-clamp-2 text-sm text-slate-200">{item.prompt}</p>
                <div className="mt-2 flex items-center justify-between gap-2 text-xs text-slate-500">
                  <span className="truncate">{item.displayQuality || item.modelName}</span>
                  <span className="shrink-0">{money(item.displayPriceVnd)}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </aside>
    </div>
  )
}
