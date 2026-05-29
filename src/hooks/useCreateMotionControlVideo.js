import { useState, useRef, useCallback } from 'react'
import { createMotionControlVideoApi, getVideoStatusApi } from '../services/videoGeneration.service'

export function useCreateMotionControlVideo() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState(null)
  const [status, setStatus] = useState(null) // null | 'queued' | 'processing' | 'succeeded' | 'failed'
  const [videoUrl, setVideoUrl] = useState(null)
  const [error, setError] = useState(null)

  const pollingRef = useRef(null)

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }
  }, [])

  const startPolling = useCallback((videoGenerationId) => {
    stopPolling()
    pollingRef.current = setInterval(async () => {
      try {
        const data = await getVideoStatusApi(videoGenerationId)
        setStatus(data.status)
        if (data.status === 'succeeded') {
          setVideoUrl(data.videoUrl)
          stopPolling()
        } else if (data.status === 'failed') {
          setError(data.errorMessage || 'Tạo video thất bại')
          stopPolling()
        }
      } catch (err) {
        setError(err.message)
        stopPolling()
      }
    }, 5000)
  }, [stopPolling])

  const submit = useCallback(async ({
    modelId,
    modelName,             // ✅ Thêm modelName từ form truyền xuống
    characterImageFile,    // File object
    referenceVideoFile,    // File object
    prompt,
    characterOrientation,  // 'image' | 'video'
    keepOriginalSound,     // "yes" | "no"
    mode,                  // 'std' | 'pro'
  }) => {
    setIsSubmitting(true)
    setError(null)
    setResult(null)
    setStatus(null)
    setVideoUrl(null)
    stopPolling()

    // ✅ Tạo preview URL ngay từ File object để hiển thị info bar ngay lập tức
    const characterImagePreview = URL.createObjectURL(characterImageFile)
    const referenceVideoPreview = URL.createObjectURL(referenceVideoFile)

    try {
      const formData = new FormData()
      formData.append('modelId', String(modelId))
      formData.append('characterImage', characterImageFile)
      formData.append('referenceVideo', referenceVideoFile)
      formData.append('prompt', prompt || '')
      formData.append('characterOrientation', characterOrientation)
      formData.append('keepOriginalSound', keepOriginalSound)
      formData.append('mode', mode || 'pro')

      const data = await createMotionControlVideoApi(formData)

      // ✅ Lưu đủ info để hiển thị center info bar
      // Ưu tiên URL từ API (cloud), fallback về object URL local
      setResult({
        ...data,
        beginImageUrl: data.characterImageUrl ?? characterImagePreview,
        referenceVideoUrl: data.referenceVideoUrl ?? referenceVideoPreview,
        promptSent: prompt || '',
        modelName: data.modelName ?? modelName ?? null,
        resolution: mode === 'pro' ? '1080p' : '720p',
      })

      setStatus('queued')
      startPolling(data.videoGenerationId)
    } catch (err) {
      setError(err.message)
      setStatus('failed')
      // Giải phóng URL nếu thất bại ngay
      URL.revokeObjectURL(characterImagePreview)
      URL.revokeObjectURL(referenceVideoPreview)
    } finally {
      setIsSubmitting(false)
    }
  }, [startPolling, stopPolling])

  return { submit, isSubmitting, result, status, videoUrl, error, stopPolling }
}