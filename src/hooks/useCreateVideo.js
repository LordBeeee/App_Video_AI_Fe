// import { useState, useRef, useCallback } from 'react'
// import { createVideoApi, getVideoStatusApi } from '../services/videoGeneration.service'

// export function useCreateVideo() {
//   const [isSubmitting, setIsSubmitting] = useState(false)
//   const [result, setResult]             = useState(null)
//   const [status, setStatus]             = useState(null)
//   const [videoUrl, setVideoUrl]         = useState(null)
//   const [error, setError]               = useState(null)

//   const pollingRef = useRef(null)

//   const stopPolling = useCallback(() => {
//     if (pollingRef.current) {
//       clearInterval(pollingRef.current)
//       pollingRef.current = null
//     }
//   }, [])

//   const startPolling = useCallback((videoGenerationId) => {
//     stopPolling()

//     pollingRef.current = setInterval(async () => {
//       try {
//         const data = await getVideoStatusApi(videoGenerationId)
//         setStatus(data.status)

//         if (data.status === 'succeeded') {
//           setVideoUrl(data.videoUrl)
//           stopPolling()
//         } else if (data.status === 'failed') {
//           setError(data.errorMessage || 'Tạo video thất bại')
//           stopPolling()
//         }
//       } catch (err) {
//         setError(err.message)
//         stopPolling()
//       }
//     }, 5000)
//   }, [stopPolling])

//   /**
//    * @param {object} params
//    * @param {string|number} params.modelId
//    * @param {string}  params.resolution
//    * @param {string}  params.duration
//    * @param {string}  params.mode          - 'std' | 'pro' | '4k'
//    * @param {string}  params.prompt        - prompt thường / intelligence mode
//    * @param {string}  [params.negativePrompt]
//    * @param {File}    params.startImageFile
//    * @param {File}    [params.endImageFile]
//    * @param {string}  [params.sound]       - 'on' | 'off'
//    * @param {number}  [params.cost]
//    *
//    * ── Multi-Shot ──────────────────────────────────────────────────────────
//    * @param {boolean} [params.multiShot]   - bật multi-shot
//    * @param {string}  [params.shotType]    - 'customize' | 'intelligence'
//    * @param {Array}   [params.multiPrompt] - [{index, prompt, duration}]
//    *   chỉ dùng khi shotType='customize'
//    */
//   const submitCreateVideo = useCallback(async ({
//     modelId,
//     resolution,
//     duration,
//     mode,
//     prompt,
//     negativePrompt,
//     startImageFile,
//     endImageFile,
//     sound      = 'off',
//     cost       = 0,
//     multiShot  = false,
//     shotType,
//     multiPrompt,
//   }) => {
//     setIsSubmitting(true)
//     setError(null)
//     setResult(null)
//     setStatus(null)
//     setVideoUrl(null)
//     stopPolling()

//     try {
//       const formData = new FormData()
//       formData.append('modelId',     String(modelId))
//       formData.append('resolution',  resolution)
//       formData.append('duration',    String(duration))
//       formData.append('mode',        mode)
//       formData.append('prompt',      prompt || '')
//       formData.append('sound',       sound)
//       formData.append('cost',        String(cost))

//       if (negativePrompt) formData.append('negativePrompt', negativePrompt)

//       formData.append('startImage', startImageFile)
//       if (endImageFile) formData.append('endImage', endImageFile)

//       // ── Multi-Shot params ──────────────────────────────────────────────
//       formData.append('multiShot', String(multiShot))

//       if (multiShot && shotType) {
//         formData.append('shotType', shotType)
//       }

//       // multiPrompt chỉ gửi khi customize mode
//       if (multiShot && shotType === 'customize' && Array.isArray(multiPrompt)) {
//         formData.append('multiPrompt', JSON.stringify(multiPrompt))
//       }

//       const data = await createVideoApi(formData)
//       setResult(data)
//       setStatus('queued')

//       startPolling(data.videoGenerationId)
//     } catch (err) {
//       setError(err.message)
//     } finally {
//       setIsSubmitting(false)
//     }
//   }, [startPolling, stopPolling])

//   return {
//     submitCreateVideo,
//     isSubmitting,
//     result,
//     status,
//     videoUrl,
//     error,
//     stopPolling,
//   }
// }

import { useState, useRef, useCallback } from 'react'
import { createVideoApi, getVideoStatusApi } from '../services/videoGeneration.service'

export function useCreateVideo() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult]             = useState(null)
  const [status, setStatus]             = useState(null)
  const [videoUrl, setVideoUrl]         = useState(null)
  const [error, setError]               = useState(null)

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

  /**
   * @param {object} params
   * @param {string|number} params.modelId
   * @param {string}  params.resolution
   * @param {string}  [params.ratio]        - '16:9' | '9:16' | ... (chỉ dùng cho BytePlus/Seedance)
   * @param {string}  params.duration
   * @param {string}  params.mode          - 'std' | 'pro' | '4k' (chỉ có ý nghĩa với Kling)
   * @param {string}  params.prompt        - prompt thường / intelligence mode
   * @param {string}  [params.negativePrompt]
   * @param {File}    params.startImageFile
   * @param {File}    [params.endImageFile]
   * @param {string}  [params.sound]       - 'on' | 'off'
   * @param {number}  [params.cost]
   *
   * ── Multi-Shot (chỉ Kling) ──────────────────────────────────────────────
   * @param {boolean} [params.multiShot]
   * @param {string}  [params.shotType]    - 'customize' | 'intelligence'
   * @param {Array}   [params.multiPrompt] - [{index, prompt, duration}]
   */
  const submitCreateVideo = useCallback(async ({
    modelId,
    resolution,
    ratio,
    duration,
    mode,
    prompt,
    negativePrompt,
    startImageFile,
    endImageFile,
    sound      = 'off',
    cost       = 0,
    multiShot  = false,
    shotType,
    multiPrompt,
  }) => {
    setIsSubmitting(true)
    setError(null)
    setResult(null)
    setStatus(null)
    setVideoUrl(null)
    stopPolling()

    try {
      const formData = new FormData()
      formData.append('modelId',     String(modelId))
      formData.append('resolution',  resolution)
      formData.append('duration',    String(duration))
      formData.append('mode',        mode)
      formData.append('prompt',      prompt || '')
      formData.append('sound',       sound)
      formData.append('cost',        String(cost))

      if (ratio) formData.append('ratio', ratio)
      if (negativePrompt) formData.append('negativePrompt', negativePrompt)

      formData.append('startImage', startImageFile)
      if (endImageFile) formData.append('endImage', endImageFile)

      // ── Multi-Shot params (Kling only) ─────────────────────────────────
      formData.append('multiShot', String(multiShot))

      if (multiShot && shotType) {
        formData.append('shotType', shotType)
      }

      if (multiShot && shotType === 'customize' && Array.isArray(multiPrompt)) {
        formData.append('multiPrompt', JSON.stringify(multiPrompt))
      }

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