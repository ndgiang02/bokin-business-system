import * as Minio from 'minio';

export const minioClient = new Minio.Client({
  endPoint:  process.env.MINIO_ENDPOINT  || 'minio',
  port:      parseInt(process.env.MINIO_PORT || '9000'),
  useSSL:    process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'root',
  secretKey: process.env.MINIO_SECRET_KEY || '12345678',
});

export const BUCKET = process.env.MINIO_BUCKET || 'business-system';

export async function ensureBucket() {
  const exists = await minioClient.bucketExists(BUCKET);
  if (!exists) {
    await minioClient.makeBucket(BUCKET, 'us-east-1');
    const policy = JSON.stringify({
      Version: '2012-10-17',
      Statement: [{
        Effect:    'Allow',
        Principal: { AWS: ['*'] },
        Action:    ['s3:GetObject'],
        Resource:  [`arn:aws:s3:::${BUCKET}/*`],
      }],
    });
    await minioClient.setBucketPolicy(BUCKET, policy);
    console.log(`Bucket "${BUCKET}" created`);
  } else {
    console.log(`Bucket "${BUCKET}" already exists`);
  }
}

export function getPublicUrl(key) {
  const protocol = process.env.MINIO_USE_SSL === 'true' ? 'https' : 'http';
  const host     = process.env.MINIO_ENDPOINT || 'localhost';
  const port     = process.env.MINIO_PORT || '9000';
  return `${protocol}://${host}:${port}/${BUCKET}/${key}`;
}