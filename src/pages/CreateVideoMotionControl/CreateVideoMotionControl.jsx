import { useState } from "react"
import FromCreateVideoMotionControl from "../../components/CreateVideo/MotionControl/FromCreateVideoMotionControl"
import VideoHistoryPanel from "../../components/CreateVideo/VideoHistoryPanel"
import { useVideoHistory } from "../../hooks/useVideoHistory"
import HeaderCreateVideo from "../../components/CreateVideo/HeaderCreateVideo"

export default function CreateVideoMotionControl() {
  const { history, loading: historyLoading, refetch } = useVideoHistory()

  const [selectedVideo, setSelectedVideo] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState(null)
  const [error, setError] = useState(null)
  const [displayVideoUrl, setDisplayVideoUrl] = useState(null)
  const [displayResult, setDisplayResult] = useState(null)

  const handleSelectHistory = (item) => {
    setSelectedVideo(item)
    setDisplayVideoUrl(item.videoUrl)
    setDisplayResult({
      beginImageUrl: item.beginImageUrl,
      promptSent: item.promptSent,
    })
  }

  const handleSubmit = async (params) => {
    setSelectedVideo(null)
    setIsSubmitting(true)
    setError(null)
    setStatus('queued')
    setDisplayVideoUrl(null)
    setDisplayResult(null)

    // TODO: gọi API motion control thực tế ở đây
    // Hiện tại chỉ là UI stub
    try {
      await new Promise((res) => setTimeout(res, 2000))
      setStatus('processing')
      await new Promise((res) => setTimeout(res, 2000))
      setStatus('succeeded')
      setTimeout(() => refetch(), 1000)
    } catch (err) {
      setStatus('failed')
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const videoToShow = selectedVideo?.videoUrl ?? displayVideoUrl

  return (
    <div>
      <HeaderCreateVideo activeTab="motion-control" />
      <main className="flex h-screen overflow-hidden bg-slate-950 pt-16 text-white">

        {/* Left Column */}
        <FromCreateVideoMotionControl
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          status={status}
          error={error}
        />

        {/* Center Column */}
        <section className="relative flex h-full min-h-0 flex-1 flex-col items-center justify-center overflow-hidden bg-slate-950 px-8 py-4">

          {/* Top info */}
          {displayResult && (
            <div className="mb-4 flex w-full max-w-5xl items-center gap-2">
              <div className="flex items-center gap-2 text-white">
                <span className="material-symbols-outlined text-2xl">switch_video</span>
                <span className="text-lg font-bold">Motion Control</span>
              </div>
              {displayResult.beginImageUrl && (
                <div className="ml-4 group/frame relative">
                  <div className="h-8 w-8 overflow-hidden rounded-md bg-slate-700">
                    <img src={displayResult.beginImageUrl} alt="Subject" className="h-full w-full object-cover" />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Video area */}
          <div className="group relative aspect-video w-full max-w-5xl flex-1 overflow-hidden rounded-2xl border border-white/5 bg-slate-900 shadow-2xl max-h-[calc(100vh-220px)]">

            {/* State 1: Chưa có gì */}
            {!status && !selectedVideo && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 scale-150 rounded-full bg-indigo-500/20 blur-3xl" />
                  <span className="material-symbols-outlined relative z-10 text-6xl text-indigo-400">switch_video</span>
                </div>
                <div className="space-y-2 text-center">
                  <p className="text-xl font-bold text-white">Ready to Create</p>
                  <p className="text-sm text-slate-400">Upload character image to begin motion control generation</p>
                </div>
              </div>
            )}

            {/* State 2: Đang xử lý */}
            {!selectedVideo && (status === 'queued' || status === 'processing') && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                <div className="relative h-16 w-16">
                  <div className="absolute inset-0 animate-spin rounded-full border-4 border-slate-700 border-t-indigo-500" />
                  <div className="absolute inset-2 animate-pulse rounded-full bg-indigo-500/20" />
                </div>
                <div className="space-y-2 text-center">
                  <p className="text-lg font-bold text-white">
                    {status === 'queued' ? 'Đang chờ xử lý...' : 'Đang tạo video...'}
                  </p>
                  <p className="text-sm text-slate-400">Thường mất 3 - 5 phút</p>
                </div>
              </div>
            )}

            {/* State 3: Video */}
            {videoToShow && (
              <video
                key={videoToShow}
                src={videoToShow}
                controls
                autoPlay
                loop
                className="h-full w-full object-contain"
              />
            )}

            {/* State 4: Thất bại */}
            {!selectedVideo && status === 'failed' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <span className="material-symbols-outlined text-6xl text-red-400">error</span>
                <div className="space-y-2 text-center">
                  <p className="text-lg font-bold text-white">Tạo video thất bại</p>
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Right Column - History */}
        <VideoHistoryPanel
          history={history}
          loading={historyLoading}
          selectedId={selectedVideo?.id}
          onSelect={handleSelectHistory}
        />
      </main>
    </div>
  )
}