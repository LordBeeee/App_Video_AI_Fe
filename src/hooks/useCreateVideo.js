import { useState, useRef, useCallback } from 'react'
import { createVideoApi, getVideoStatusApi } from '../services/videoGeneration.service'

export function useCreateVideo() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState(null)
  const [status, setStatus] = useState(null)
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

  const submitCreateVideo = useCallback(async ({
    modelId,
    resolution,
    duration,
    mode,
    prompt,
    negativePrompt,
    startImageFile,
    endImageFile,
    sound = 'off',
  }) => {
    setIsSubmitting(true)
    setError(null)
    setResult(null)
    setStatus(null)
    setVideoUrl(null)
    stopPolling()

    try {
      const formData = new FormData()
      formData.append('modelId', String(modelId))
      formData.append('resolution', resolution)
      formData.append('duration', String(duration))
      formData.append('mode', mode)
      formData.append('prompt', prompt)
      formData.append('sound', sound)
      if (negativePrompt) formData.append('negativePrompt', negativePrompt)
      formData.append('startImage', startImageFile)
      if (endImageFile) formData.append('endImage', endImageFile)

      const data = await createVideoApi(formData)
      setResult(data)
      setStatus('queued')

      startPolling(data.videoGenerationId)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }, [startPolling, stopPolling])

  return {
    submitCreateVideo,
    isSubmitting,
    result,
    status,
    videoUrl,
    error,
    stopPolling,
  }
}