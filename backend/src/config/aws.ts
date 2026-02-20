import * as AWS from 'aws-sdk';

const s3Enabled = process.env.AWS_S3_ENABLED === 'true';

/**
 * S3 Client Configuration
 * Graceful degradation: Falls back to local storage if AWS is not configured
 */
export const s3 = s3Enabled ? new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1',
}) : null;

/**
 * Get the full URL for an asset
 * @param path - Relative path to the asset (e.g., "players/abc-123.jpg")
 * @returns Full URL (CloudFront or local)
 */
export const getAssetUrl = (path: string): string => {
  if (!s3Enabled || !process.env.AWS_CLOUDFRONT_URL) {
    // Local fallback - serve from backend uploads directory
    return `/uploads/${path}`;
  }

  // CloudFront CDN URL
  return `${process.env.AWS_CLOUDFRONT_URL}/${path}`;
};

/**
 * S3 Upload Parameters
 */
export const S3_BUCKET = process.env.AWS_S3_BUCKET || '';
export const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '5242880'); // 5MB default

if (s3Enabled) {
  console.log('✅ AWS S3 enabled for file uploads');
  console.log(`   Bucket: ${S3_BUCKET}`);
  console.log(`   Region: ${process.env.AWS_REGION || 'us-east-1'}`);
  console.log(`   CloudFront: ${process.env.AWS_CLOUDFRONT_URL || 'Not configured'}`);
} else {
  console.log('ℹ️  AWS S3 disabled - using local file storage');
}
