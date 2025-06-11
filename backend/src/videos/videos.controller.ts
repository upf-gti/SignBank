import { Controller, Post, Delete, UploadedFile, UseInterceptors, Body, Param } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { VideosService } from './videos.service';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { promises as fs } from 'fs';

@Controller('videos')
@UseGuards(JwtGuard, RolesGuard)
export class VideosController {
  constructor(private readonly videosService: VideosService) {
    // Ensure upload directories exist on startup
    this.initializeUploadDirectories();
  }

  private async initializeUploadDirectories() {
    const baseDir = join(process.cwd(), 'uploads');
    const directories = ['gloss-videos', 'example-videos'];

    try {
      // Create base uploads directory
      await fs.mkdir(baseDir, { recursive: true });

      // Create subdirectories
      for (const dir of directories) {
        await fs.mkdir(join(baseDir, dir), { recursive: true });
      }
    } catch (error) {
      console.error('Error creating upload directories:', error);
    }
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('video', {
      storage: diskStorage({
        destination: async (req, file, cb) => {
          const type = req.body.type || 'gloss';
          const baseDir = type === 'example' ? 'example-videos' : 'gloss-videos';
          const uploadPath = join(process.cwd(), 'uploads', baseDir);
          
          try {
            await fs.mkdir(uploadPath, { recursive: true });
            cb(null, uploadPath);
          } catch (error) {
            cb(error, uploadPath);
          }
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.includes('video')) {
          return cb(new Error('Only video files are allowed!'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 1024 * 1024 * 100, // 100MB limit
      },
    }),
  )
  async uploadVideo(
    @UploadedFile() file: Express.Multer.File,
    @Body('type') type: 'gloss' | 'example' = 'gloss'
  ) {
    return this.videosService.uploadVideo(file, type);
  }

  @Delete(':videoUrl(*)')
  async deleteVideo(@Param('videoUrl') videoUrl: string) {
    return this.videosService.deleteVideo(videoUrl);
  }
} 