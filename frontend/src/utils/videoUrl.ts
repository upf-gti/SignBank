import { ref } from 'vue'

// Get the base URL from environment variables or use a default
const baseUrl = import.meta.env.VITE_API_BASE_URL || window.location.origin

// Create a reactive ref to store the base URL
export const currentBaseUrl = ref(baseUrl)

const DRIVE_FILE_ID_PATTERN = /^[a-zA-Z0-9_-]{10,128}$/

function isDriveFileId(fileId: string): boolean {
  return DRIVE_FILE_ID_PATTERN.test(fileId)
}

function hostLooksLikeGoogleDrive(hostname: string): boolean {
  const host = hostname.toLowerCase()
  return host.includes('google.com') || host.includes('googleusercontent.com')
}

export function extractGoogleDriveFileId(value: string): string | null {
  if (!value?.trim()) {
    return null
  }

  try {
    const parsed = new URL(value.trim())
    if (!hostLooksLikeGoogleDrive(parsed.hostname)) {
      return null
    }

    const fromQuery = parsed.searchParams.get('id')
    if (fromQuery && isDriveFileId(fromQuery)) {
      return fromQuery
    }

    const fromPath = parsed.pathname.match(/\/(?:file\/)?d\/([^/]+)/)
    if (fromPath?.[1] && isDriveFileId(fromPath[1])) {
      return fromPath[1]
    }
  } catch {
    return null
  }

  return null
}

export function extractGoogleDriveResourceKey(value: string): string | null {
  try {
    const parsed = new URL(value.trim())
    return parsed.searchParams.get('resourcekey') || parsed.searchParams.get('resourceKey')
  } catch {
    return null
  }
}

export function getGoogleDrivePreviewUrl(value: string): string | null {
  const fileId = extractGoogleDriveFileId(value)
  if (!fileId) {
    return null
  }
  return `https://drive.google.com/file/d/${fileId}/preview`
}

/**
 * Converts a stored video path or Drive URL into a playable URL
 * @param relativePath - Relative Dufs path or full URL stored in the DB
 * @returns The URL the browser should load in a video element
 */
export function getVideoUrl(relativePath: string): string {
  if (!relativePath) return ''

  const driveFileId = extractGoogleDriveFileId(relativePath)
  if (driveFileId) {
    const resourceKey = extractGoogleDriveResourceKey(relativePath)
    const params = resourceKey ? `?resourceKey=${encodeURIComponent(resourceKey)}` : ''
    return `${currentBaseUrl.value}/api/videos/drive/${driveFileId}${params}`
  }
  
  // If it's already a full URL, return it as is
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath
  }

  // If it's a relative path, prepend the base URL and lscassets
  return `${currentBaseUrl.value}/lscassets/${relativePath}`
}

/**
 * Converts a full video URL to a relative path
 * @param fullUrl - The full URL of the video
 * @returns The relative path of the video
 */
export function getRelativeVideoPath(fullUrl: string): string {
  if (!fullUrl) return ''

  if (extractGoogleDriveFileId(fullUrl)) {
    return fullUrl
  }

  // If it's already a relative path, return it as is
  if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
    return fullUrl
  }

  // Try to extract the relative path after 'lscassets/'
  const match = fullUrl.match(/\/lscassets\/(.*)/i)
  if (match && match[1]) {
    return match[1]
  }

  // If no match found, return the original URL
  return fullUrl
}
