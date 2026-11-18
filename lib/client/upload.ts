import { getUploadCredentials } from '@/actions/upload-actions'
import { ACCEPTED_IMAGE_TYPES, IMAGE_EXTENSIONS, MAX_UPLOAD_BYTES } from '@/constants/upload'

export class UploadError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'UploadError'
  }
}

const isAccepted = (type: string): boolean => (ACCEPTED_IMAGE_TYPES as readonly string[]).includes(type)

/** Returns a user-facing reason the file can't be uploaded, or null if it's fine. */
export const validateImage = (file: File): string | null => {
  if (!isAccepted(file.type)) return 'We support .jpg, .png, .gif, .webp and .bmp files.'
  if (file.size > MAX_UPLOAD_BYTES) return 'Images can be up to 25MB.'
  return null
}

/**
 * Upload an image straight to storage and return its public URL.
 * Flow: get credentials from our API -> POST a multipart form to the storage endpoint (expects 201).
 */
export const uploadImage = async (file: File): Promise<string> => {
  const problem = validateImage(file)
  if (problem) throw new UploadError(problem)

  const result = await getUploadCredentials()
  if (!result.ok) throw new UploadError(result.error)
  const { access_key, policy, signature, prefix, endpoint } = result.data

  const key = `${prefix}/ello-${crypto.randomUUID()}.${IMAGE_EXTENSIONS[file.type] ?? 'jpg'}`
  const form = new FormData()
  form.append('key', key)
  form.append('AWSAccessKeyId', access_key)
  form.append('acl', 'public-read')
  form.append('success_action_status', '201')
  form.append('policy', policy)
  form.append('signature', signature)
  form.append('Content-Type', file.type)
  form.append('file', file)

  const response = await fetch(endpoint, { method: 'POST', body: form }).catch(() => {
    throw new UploadError('Could not reach the upload server.')
  })
  if (response.status !== 201) throw new UploadError('The upload failed. Please try again.')
  return `${endpoint}/${key}`
}
