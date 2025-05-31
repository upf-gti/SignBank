import { ref } from 'vue'

// Get the base URL from environment variables or use a default
const baseUrl = import.meta.env.VITE_API_BASE_URL || window.location.origin

// Create a reactive ref to store the base URL
export const currentBaseUrl = ref(baseUrl)

/**
 * Converts a relative video path to a full URL
 * @param relativePath - The relative path of the video (e.g., 'videos/example.mp4')
 * @returns The full URL to the video
 */
export function getVideoUrl(relativePath: string): string {
  if (!relativePath) return ''
  
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