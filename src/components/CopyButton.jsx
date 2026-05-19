import { useState } from "react"

export default function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async (e) => {
    e.stopPropagation() // tránh trigger hover popup
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback cho trình duyệt không hỗ trợ clipboard API
      const el = document.createElement('textarea')
      el.value = text
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={copied ? 'Đã sao chép!' : 'Sao chép prompt'}
      className="mt-1 flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1.5 text-xs
                 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
    >
      {copied ? (
        <>
          <span className="material-symbols-outlined text-base text-emerald-400">check</span>
          <span className="text-emerald-400">Đã sao chép</span>
        </>
      ) : (
        <>
          <span className="material-symbols-outlined text-base">content_copy</span>
          <span>Sao chép</span>
        </>
      )}
    </button>
  )
}