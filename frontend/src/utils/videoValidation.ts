// Video validation utilities
export const MAX_VIDEO_SIZE = 20 * 1024 * 1024; // 20MB in bytes
export const MAX_VIDEO_SIZE_MB = 20; // 20MB for display

// Only allow these well-supported web video formats
export const ALLOWED_VIDEO_FORMATS = [
  'video/mp4',
  'video/webm', 
  'video/ogg'
];

import translate from "./translate";

export interface VideoValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateVideoFile = (file: File): VideoValidationResult => {
  // Check file type
  if (!file.type.startsWith('video/')) {
    return {
      isValid: false,
      error: translate('errors.invalidVideoFile')
    };
  }

  // Only allow specific video formats
  if (!ALLOWED_VIDEO_FORMATS.includes(file.type)) {
    return {
      isValid: false,
      error: translate('errors.unsupportedVideoFormat') || 'Only MP4, WebM, and OGG video formats are supported.'
    };
  }

  // Check file size
  if (file.size > MAX_VIDEO_SIZE) {
    const currentSize = (file.size / (1024 * 1024)).toFixed(1);
    return {
      isValid: false,
      error: translate('errors.videoFileTooLarge', { maxSize: MAX_VIDEO_SIZE_MB, currentSize: currentSize }) 
    };
  }

  return { isValid: true };
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}; 