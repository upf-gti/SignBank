import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { createReadStream } from 'fs';
import { stat, unlink } from 'fs/promises';
import axios from 'axios';
import { basename } from 'path';
import { Readable } from 'stream';
import type { Request, Response } from 'express';
import { isDriveFileId, isGoogleDriveUrl } from './google-drive.util';

function asHeaderString(value: unknown, fallback?: string): string | undefined {
  if (value == null || typeof value === 'boolean') {
    return fallback;
  }
  if (Array.isArray(value)) {
    return value.join(', ');
  }
  return String(value);
}

@Injectable()
export class VideosService {
  private readonly dufsUrl = process.env.DUFS_URL || 'http://localhost:5000';

  constructor() {
    if (!process.env.GOOGLE_DRIVE_API_KEY?.trim()) {
      console.warn(
        'GOOGLE_DRIVE_API_KEY is not set; Google Drive videos will not play',
      );
    }
  }

  async uploadVideo(file: any, type: 'gloss' | 'example' | 'definition' = 'gloss'): Promise<{ url: string }> {
    try {
      const fileStream = createReadStream(file.path);
      const stats = await stat(file.path);
      // Use the filename that Multer generated (the basename of the full path)
      const uniqueFilename = basename(file.path);
      let baseDir: string;
      
      switch (type) {
        case 'example':
          baseDir = 'example-videos';
          break;
        case 'definition':
          baseDir = 'definition-videos';
          break;
        default:
          baseDir = 'gloss-videos';
      }
      
      const uploadUrl = `${this.dufsUrl}/${baseDir}/${uniqueFilename}`;
      
      await axios.put(uploadUrl, fileStream, {
        headers: {
          'Content-Type': file.mimetype,
          'Content-Length': stats.size,
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      });

      // Clean up the temporary file
      await unlink(file.path);

      // Return relative path instead of full URL
      return {
        url: `${baseDir}/${uniqueFilename}`,
      };
    } catch (error) {
      // Clean up the temporary file in case of error
      try {
        await unlink(file.path);
      } catch {
        // Ignore cleanup errors
      }
      
      throw new HttpException(
        'Failed to upload video',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteVideo(videoUrl: string): Promise<void> {
    console.log('Deleting video', videoUrl);

    if (
      isGoogleDriveUrl(videoUrl) ||
      videoUrl.startsWith('http://') ||
      videoUrl.startsWith('https://')
    ) {
      return;
    }

    try {
      // The videoUrl is already in the format "baseDir/filename"
      const deleteUrl = `${this.dufsUrl}/${videoUrl}`;
      
      await axios.delete(deleteUrl);
    } catch {
      throw new HttpException(
        'Failed to delete video',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async streamDriveVideo(
    fileId: string,
    req: Request,
    res: Response,
    resourceKey?: string,
  ): Promise<void> {
    if (!isDriveFileId(fileId)) {
      throw new HttpException('Invalid Google Drive file id', HttpStatus.BAD_REQUEST);
    }

    const apiKey = process.env.GOOGLE_DRIVE_API_KEY?.trim();
    if (!apiKey) {
      throw new HttpException(
        'GOOGLE_DRIVE_API_KEY is not configured',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    const driveUrl = new URL(
      `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}`,
    );
    driveUrl.searchParams.set('alt', 'media');
    driveUrl.searchParams.set('supportsAllDrives', 'true');
    driveUrl.searchParams.set('key', apiKey);

    const headers: Record<string, string> = {};
    const range = req.headers.range;
    if (typeof range === 'string' && range.length > 0) {
      headers.Range = range;
    }
    if (resourceKey) {
      headers['X-Goog-Drive-Resource-Keys'] = `${fileId}/${resourceKey}`;
    }

    try {
      const driveResponse = await axios.get(driveUrl.toString(), {
        headers,
        responseType: 'stream',
        timeout: 0,
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        validateStatus: (status) => status === 200 || status === 206,
      });

      res.status(driveResponse.status);
      res.setHeader(
        'Content-Type',
        asHeaderString(driveResponse.headers['content-type'], 'video/mp4')!,
      );
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Cache-Control', 'public, max-age=3600');

      const contentLength = asHeaderString(driveResponse.headers['content-length']);
      if (contentLength) {
        res.setHeader('Content-Length', contentLength);
      }
      const contentRange = asHeaderString(driveResponse.headers['content-range']);
      if (contentRange) {
        res.setHeader('Content-Range', contentRange);
      }

      const stream = driveResponse.data as Readable;
      const abort = () => {
        stream.destroy();
      };
      req.on('close', abort);
      stream.on('error', abort);
      stream.pipe(res);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const data = error.response?.data;
        if (data instanceof Readable) {
          data.destroy();
        }

        if (status === 401 || status === 403) {
          throw new HttpException(
            'Google Drive denied access. Share the file with "Anyone with the link" and check GOOGLE_DRIVE_API_KEY.',
            HttpStatus.FORBIDDEN,
          );
        }
        if (status === 404) {
          throw new HttpException(
            'Google Drive file not found. Confirm the file id and that it is shared with "Anyone with the link".',
            HttpStatus.NOT_FOUND,
          );
        }
      }

      throw new HttpException(
        'Failed to fetch video from Google Drive',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
}
