import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { createReadStream } from 'fs';
import { stat, unlink } from 'fs/promises';
import axios from 'axios';
import { basename } from 'path';

@Injectable()
export class VideosService {
  private readonly dufsUrl = process.env.DUFS_URL || 'http://localhost:5000';

  async uploadVideo(file: Express.Multer.File): Promise<{ url: string }> {
    try {
      const fileStream = createReadStream(file.path);
      const stats = await stat(file.path);
      
      // Use the filename that Multer generated (the basename of the full path)
      const uniqueFilename = basename(file.path);
      const uploadUrl = `${this.dufsUrl}/videos/${uniqueFilename}`;
      
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
        url: `videos/${uniqueFilename}`,
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
} 