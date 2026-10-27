import test from 'node:test'
import assert from 'node:assert/strict'
import { videoSourceGroups } from './videoSources.utils.js'

test('Kling Omni groups one first frame and four reference images', () => {
  const inputs = [1, 2, 3, 4, 5].map((id, index) => ({
    id, type: 'image', role: index === 0 ? 'input' : 'reference', url: `https://example.com/${id}.png`,
  }))
  const item = {
    modelSlug: 'kling/kling-3.0-omni',
    options: { referenceInputs: inputs.map((input, index) => ({
      type: index === 0 ? 'first_frame' : 'refer_image',
      id: `image_${input.id}`, url: input.url,
    })) },
  }

  const groups = videoSourceGroups(item, inputs)

  assert.deepEqual(groups.map((group) => [group.label, group.items.length]), [
    ['Ảnh đầu/cuối', 1], ['Ảnh tham chiếu', 4],
  ])
  assert.equal(groups[0].items[0].label, 'Ảnh đầu')
  assert.ok(groups[1].items.every((asset) => asset.label === 'Ảnh tham chiếu'))
})

test('groups end frame, video and Elements without creating empty groups', () => {
  const item = {
    modelSlug: 'kling/kling-3.0-omni',
    options: { referenceInputs: [
      { type: 'first_frame', id: 'image_1' },
      { type: 'last_frame', id: 'image_2' },
      { type: 'feature_video', id: 'video_3' },
    ] },
    elementAssets: [{ id: 4, type: 'image', name: 'Nhân vật', url: 'https://example.com/element.png' }],
  }
  const inputs = [
    { id: 1, type: 'image', url: 'https://example.com/start.png' },
    { id: 2, type: 'image', url: 'https://example.com/end.png' },
    { id: 3, type: 'video', url: 'https://example.com/reference.mp4' },
  ]

  const groups = videoSourceGroups(item, inputs)

  assert.deepEqual(groups.map((group) => [group.label, group.items.length]), [
    ['Ảnh đầu/cuối', 2], ['Video tham chiếu', 1], ['Element', 1],
  ])
  assert.deepEqual(groups[0].items.map((asset) => asset.label), ['Ảnh đầu', 'Ảnh cuối'])
})

test('uses stored reference order for standard first and last frames', () => {
  const first = { id: 1, type: 'image', url: 'https://example.com/first.png' }
  const last = { id: 2, type: 'image', url: 'https://example.com/last.png' }
  const groups = videoSourceGroups({ options: {
    referenceMode: 'first_frame', referenceUrls: [first.url, last.url],
  } }, [last, first])

  assert.deepEqual(groups[0].items.map((asset) => asset.label), ['Ảnh đầu', 'Ảnh cuối'])
  assert.deepEqual(groups[0].items.map((asset) => asset.id), [1, 2])
})
