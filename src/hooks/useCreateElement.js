import { useState, useRef, useCallback } from 'react'
import { createElementApi, getElementStatusApi } from '../services/element.service'

export function useCreateElement() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult]             = useState(null)
  const [status, setStatus]             = useState(null)
  const [error, setError]               = useState(null)

  const pollingRef = useRef(null)

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }
  }, [])

  const startPolling = useCallback((elementId, onDone) => {
    stopPolling()
    pollingRef.current = setInterval(async () => {
      try {
        const data = await getElementStatusApi(elementId)
        setStatus(data.status)
        if (data.status === 'succeeded') {
          stopPolling()
          onDone?.()
        } else if (data.status === 'failed') {
          setError(data.errorMessage || 'Tạo element thất bại')
          stopPolling()
        }
      } catch (err) {
        setError(err.message)
        stopPolling()
      }
    }, 3000)
  }, [stopPolling])

  /**
   * @param {object} params
   * @param {string|number} params.providerId
   * @param {'image_refer'|'video_refer'} params.referenceType
   * @param {string} params.elementName
   * @param {string} params.elementDescription
   * @param {string} [params.elementVoiceId]
   * @param {number} [params.frontalImageAssetId]
   * @param {File}   [params.frontalImageFile]
   * @param {Array<{assetId?:number, file?:File}>} [params.referImages]
   * @param {number} [params.videoAssetId]
   * @param {File}   [params.videoFile]
   * @param {Function} [onDone] - gọi khi Kling trả succeeded (để refetch list)
   */
  const submitCreateElement = useCallback(async (params, onDone) => {
    setIsSubmitting(true)
    setError(null)
    setResult(null)
    setStatus(null)
    stopPolling()

    try {
      const formData = new FormData()
      formData.append('providerId', String(params.providerId))
      formData.append('referenceType', params.referenceType)
      formData.append('elementName', params.elementName)
      formData.append('elementDescription', params.elementDescription)

      if (params.referenceType === 'image_refer') {
        if (params.elementVoiceId) formData.append('elementVoiceId', params.elementVoiceId)

        if (params.frontalImageAssetId) {
          formData.append('frontalImageAssetId', String(params.frontalImageAssetId))
        } else if (params.frontalImageFile) {
          formData.append('frontalImage', params.frontalImageFile)
        }

        const referAssetIds = []
        params.referImages?.forEach((r) => {
          if (r.assetId) referAssetIds.push(r.assetId)
          else if (r.file) formData.append('referImages', r.file)
        })
        if (referAssetIds.length > 0) {
          formData.append('referImageAssetIds', JSON.stringify(referAssetIds))
        }
      } else {
        if (params.videoAssetId) {
          formData.append('videoAssetId', String(params.videoAssetId))
        } else if (params.videoFile) {
          formData.append('video', params.videoFile)
        }
      }

      const data = await createElementApi(formData)
      setResult(data)
      setStatus('processing')
      startPolling(data.elementId, onDone)
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setIsSubmitting(false)
    }
  }, [startPolling, stopPolling])

  return { submitCreateElement, isSubmitting, result, status, error, stopPolling }
}