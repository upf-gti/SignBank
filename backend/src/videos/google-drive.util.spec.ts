import {
  extractGoogleDriveFileId,
  extractGoogleDriveResourceKey,
  isDriveFileId,
  isGoogleDriveUrl,
} from './google-drive.util';

describe('google-drive.util', () => {
  const fileId = '1f8YqJU_Lne5Az0o8gyAR1CAPKE3CbA8x';

  it('accepts typical Drive file ids', () => {
    expect(isDriveFileId(fileId)).toBe(true);
    expect(isDriveFileId('short')).toBe(false);
    expect(isDriveFileId('../etc/passwd')).toBe(false);
  });

  it('extracts ids from sharing links', () => {
    expect(
      extractGoogleDriveFileId(
        `https://drive.google.com/file/d/${fileId}/view?usp=sharing`,
      ),
    ).toBe(fileId);
  });

  it('extracts ids from open and uc links', () => {
    expect(
      extractGoogleDriveFileId(`https://drive.google.com/open?id=${fileId}`),
    ).toBe(fileId);
    expect(
      extractGoogleDriveFileId(
        `https://drive.google.com/uc?export=download&id=${fileId}`,
      ),
    ).toBe(fileId);
  });

  it('reads resource keys', () => {
    expect(
      extractGoogleDriveResourceKey(
        `https://drive.google.com/file/d/${fileId}/view?usp=sharing&resourcekey=abc-123`,
      ),
    ).toBe('abc-123');
  });

  it('ignores non-Drive paths', () => {
    expect(extractGoogleDriveFileId('gloss-videos/example.mp4')).toBeNull();
    expect(isGoogleDriveUrl('https://example.com/video.mp4')).toBe(false);
  });
});
