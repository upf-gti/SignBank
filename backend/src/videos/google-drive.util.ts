const DRIVE_FILE_ID_PATTERN = /^[a-zA-Z0-9_-]{10,128}$/;

export function isDriveFileId(fileId: string): boolean {
  return DRIVE_FILE_ID_PATTERN.test(fileId);
}

function hostLooksLikeGoogleDrive(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return host.includes('google.com') || host.includes('googleusercontent.com');
}

export function extractGoogleDriveFileId(value: string): string | null {
  if (!value?.trim()) {
    return null;
  }

  try {
    const parsed = new URL(value.trim());
    if (!hostLooksLikeGoogleDrive(parsed.hostname)) {
      return null;
    }

    const fromQuery = parsed.searchParams.get('id');
    if (fromQuery && isDriveFileId(fromQuery)) {
      return fromQuery;
    }

    const fromPath = parsed.pathname.match(/\/(?:file\/)?d\/([^/]+)/);
    if (fromPath?.[1] && isDriveFileId(fromPath[1])) {
      return fromPath[1];
    }
  } catch {
    return null;
  }

  return null;
}

export function extractGoogleDriveResourceKey(value: string): string | null {
  try {
    const parsed = new URL(value.trim());
    return parsed.searchParams.get('resourcekey') || parsed.searchParams.get('resourceKey');
  } catch {
    return null;
  }
}

export function isGoogleDriveUrl(value: string): boolean {
  return extractGoogleDriveFileId(value) !== null;
}
