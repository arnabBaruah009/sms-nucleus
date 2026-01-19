import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Logger,
  Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { diskStorage } from 'multer';
import { extname, join } from 'path';

@Controller('api/v1/upload')
export class UploadController {
  private readonly logger = new Logger(UploadController.name);

  constructor(private readonly uploadService: UploadService) {
    // Service ensures upload directory exists in its constructor
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          cb(null, join(process.cwd(), 'uploads'));
        },
        filename: (req, file, cb) => {
          const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ): Promise<{
    url: string;
    filename: string;
    originalName: string;
    size: number;
    message?: string;
  }> {
    try {
      if (!file) {
        throw new BadRequestException('No file uploaded');
      }

      this.logger.debug({
        message: 'File uploaded successfully',
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
      });

      const url = this.uploadService.getFileUrl(req, file.filename);

      return {
        url,
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        message: 'File uploaded successfully',
      };
    } catch (error) {
      this.logger.error({
        error,
        message: 'Error uploading file',
      });
      throw error;
    }
  }
}
