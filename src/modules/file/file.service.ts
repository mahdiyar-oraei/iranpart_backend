import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { unlink } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class FileService {
  constructor(private configService: ConfigService) {}

  async uploadFile(file: Express.Multer.File): Promise<{ filename: string; url: string; size: number }> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const baseUrl = `${this.configService.get<string>('BASE_URL') || 'http://localhost:3000'}`;
    
    return {
      filename: file.filename,
      url: `${baseUrl}/uploads/${file.filename}`,
      size: file.size,
    };
  }

  async uploadMultipleFiles(files: Express.Multer.File[]): Promise<Array<{ filename: string; url: string; size: number }>> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    const baseUrl = `${this.configService.get<string>('BASE_URL') || 'http://localhost:3000'}`;
    
    return files.map(file => ({
      filename: file.filename,
      url: `${baseUrl}/uploads/${file.filename}`,
      size: file.size,
    }));
  }

  async deleteFile(filename: string): Promise<void> {
    try {
      const uploadPath = this.configService.get<string>('UPLOAD_PATH') || './uploads';
      const filePath = join(uploadPath, filename);
      await unlink(filePath);
    } catch (error) {
      throw new BadRequestException('File not found or cannot be deleted');
    }
  }

  getFileUrl(filename: string): string {
    const baseUrl = `${this.configService.get<string>('BASE_URL') || 'http://localhost:3000'}`;
    return `${baseUrl}/uploads/${filename}`;
  }
}
