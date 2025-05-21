import { Injectable, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DownloadService {
  private readonly zipsFolder = path.join(process.cwd(), 'src', 'zips');

  /**
   * Sends the requested zip file to the client for download.
   * @param fileName Name of the zip file requested, e.g., '12345.zip'
   * @param res Express Response object to stream the file
   */
  async downloadZipFile(fileName: string, res: Response): Promise<void> {
    const filePath = path.join(this.zipsFolder, fileName);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException(`File ${fileName} not found.`);
    }

    // Set headers for download
    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Content-Length': fs.statSync(filePath).size,
    });

    // Create read stream and pipe to response
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  }
}
