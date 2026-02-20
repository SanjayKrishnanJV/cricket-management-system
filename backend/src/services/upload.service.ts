import * as path from 'path';
import * as fs from 'fs/promises';
import { s3, getAssetUrl, S3_BUCKET } from '../config/aws';
import * as mime from 'mime-types';

/**
 * Upload Service
 * Handles file uploads to AWS S3 or local storage with graceful fallback
 */
export class UploadService {
  /**
   * Upload a file to S3 or local storage
   * @param file - File buffer
   * @param folder - Folder name (e.g., 'players', 'teams', 'scorecards')
   * @param filename - Filename with extension
   * @returns URL to the uploaded file
   */
  async uploadFile(file: Buffer, folder: string, filename: string): Promise<string> {
    if (!s3) {
      // Local storage fallback
      return this.uploadToLocal(file, folder, filename);
    }

    try {
      // Upload to S3
      return await this.uploadToS3(file, folder, filename);
    } catch (error) {
      console.error('S3 upload failed, falling back to local storage:', error);
      // Fallback to local storage on S3 error
      return this.uploadToLocal(file, folder, filename);
    }
  }

  /**
   * Upload file to AWS S3
   * @private
   */
  private async uploadToS3(file: Buffer, folder: string, filename: string): Promise<string> {
    if (!s3) throw new Error('S3 client not initialized');

    const key = `${folder}/${filename}`;
    const contentType = mime.lookup(filename) || 'application/octet-stream';

    await s3.upload({
      Bucket: S3_BUCKET,
      Key: key,
      Body: file,
      ContentType: contentType,
      ACL: 'public-read', // Make files publicly accessible
    }).promise();

    return getAssetUrl(key);
  }

  /**
   * Upload file to local storage
   * @private
   */
  private async uploadToLocal(file: Buffer, folder: string, filename: string): Promise<string> {
    const uploadsDir = path.join(__dirname, '../../uploads', folder);

    // Create directory if it doesn't exist
    await fs.mkdir(uploadsDir, { recursive: true });

    const filePath = path.join(uploadsDir, filename);
    await fs.writeFile(filePath, file);

    return getAssetUrl(`${folder}/${filename}`);
  }

  /**
   * Upload player image
   * @param file - Image buffer
   * @param playerId - Player ID
   * @returns URL to the uploaded image
   */
  async uploadPlayerImage(file: Buffer, playerId: string): Promise<string> {
    const filename = `${playerId}-${Date.now()}.jpg`;
    return this.uploadFile(file, 'players', filename);
  }

  /**
   * Upload team logo
   * @param file - Logo buffer
   * @param teamId - Team ID
   * @returns URL to the uploaded logo
   */
  async uploadTeamLogo(file: Buffer, teamId: string): Promise<string> {
    const filename = `${teamId}-${Date.now()}.png`;
    return this.uploadFile(file, 'teams', filename);
  }

  /**
   * Upload match scorecard PDF
   * @param file - PDF buffer
   * @param matchId - Match ID
   * @returns URL to the uploaded PDF
   */
  async uploadScorecard(file: Buffer, matchId: string): Promise<string> {
    const filename = `scorecard-${matchId}-${Date.now()}.pdf`;
    return this.uploadFile(file, 'scorecards', filename);
  }

  /**
   * Delete file from S3 or local storage
   * @param fileUrl - URL of the file to delete
   */
  async deleteFile(fileUrl: string): Promise<boolean> {
    try {
      // Extract key from URL
      const urlParts = fileUrl.split('/uploads/');
      if (urlParts.length < 2) {
        console.error('Invalid file URL:', fileUrl);
        return false;
      }

      const key = urlParts[1];

      if (s3) {
        // Delete from S3
        await s3.deleteObject({
          Bucket: S3_BUCKET,
          Key: key,
        }).promise();
      } else {
        // Delete from local storage
        const filePath = path.join(__dirname, '../../uploads', key);
        await fs.unlink(filePath);
      }

      return true;
    } catch (error) {
      console.error('File deletion error:', error);
      return false;
    }
  }

  /**
   * Check if a file exists
   * @param fileUrl - URL of the file to check
   */
  async fileExists(fileUrl: string): Promise<boolean> {
    try {
      const urlParts = fileUrl.split('/uploads/');
      if (urlParts.length < 2) return false;

      const key = urlParts[1];

      if (s3) {
        // Check S3
        await s3.headObject({
          Bucket: S3_BUCKET,
          Key: key,
        }).promise();
        return true;
      } else {
        // Check local storage
        const filePath = path.join(__dirname, '../../uploads', key);
        await fs.access(filePath);
        return true;
      }
    } catch (error) {
      return false;
    }
  }
}

export const uploadService = new UploadService();
