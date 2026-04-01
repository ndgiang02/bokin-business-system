import sharp       from 'sharp';
import { v4 as uuid } from 'uuid';
import { minioClient, BUCKET, getPublicUrl } from '../config/minio.js';

export function getFileType(mimeType) {
  if (mimeType.startsWith('image/'))  return 'image';
  if (mimeType.startsWith('video/'))  return 'video';
  if (mimeType.startsWith('audio/'))  return 'audio';
  return 'document';
}

const ALLOWED_MIMES = [
  // Ảnh
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  // Video
  'video/mp4', 'video/quicktime', 'video/x-msvideo',
  // Audio
  'audio/wav', 'audio/mpeg', 'audio/mp3', 'audio/ogg',
  // Document
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

export function isAllowedMime(mimeType) {
  return ALLOWED_MIMES.includes(mimeType);
}

const SIZE_LIMITS = {
  image:    10 * 1024 * 1024,   // 10MB
  video:    100 * 1024 * 1024,  // 100MB
  audio:    20 * 1024 * 1024,   // 20MB
  document: 20 * 1024 * 1024,   // 20MB
};

export function checkSizeLimit(mimeType, size) {
  const fileType = getFileType(mimeType);
  const limit    = SIZE_LIMITS[fileType];
  if (size > limit) {
    throw new Error(
      `File quá lớn. Giới hạn ${fileType}: ${limit / (1024 * 1024)}MB`
    );
  }
}

function generateKey(mimeType, folder = 'requests') {
  const d   = new Date();
  const ext = mimeType.split('/')[1]
    ?.replace('vnd.openxmlformats-officedocument.wordprocessingml.document', 'docx')
    ?.replace('vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'xlsx')
    ?.replace('vnd.ms-excel', 'xls')
    ?.replace('msword', 'doc')
    || 'bin';

  const date = `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}`;
  return `${folder}/${date}/${uuid()}.${ext}`;
}

export async function uploadOne(file, folder = 'requests') {
  const { buffer, originalname, mimetype, size } = file;

  // Validate
  if (!isAllowedMime(mimetype)) {
    throw new Error(`Định dạng không hỗ trợ: ${mimetype}`);
  }
  checkSizeLimit(mimetype, size);

  const fileType = getFileType(mimetype);
  let   uploadBuffer = buffer;
  let   uploadSize   = size;
  let   uploadMime   = mimetype;

  // Compress ảnh bằng sharp
  if (fileType === 'image') {
    uploadBuffer = await sharp(buffer)
      .resize({ width: 1200, withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();
    uploadSize = uploadBuffer.length;
    uploadMime = 'image/jpeg';
  }

  const key = generateKey(uploadMime, folder);

  await minioClient.putObject(BUCKET, key, uploadBuffer, uploadSize, {
    'Content-Type':              uploadMime,
    'x-amz-meta-original-name': originalname,
    'x-amz-meta-file-type':     fileType,
  });

  return {
    key,
    url:      getPublicUrl(key),
    name:     originalname,
    size:     uploadSize,
    mimeType: uploadMime,
    fileType,
  };
}

// ── Upload nhiều file ─────────────────────────────────────
export async function uploadMany(files, folder = 'requests') {
  return Promise.all(files.map(f => uploadOne(f, folder)));
}

// ── Xóa file khỏi MinIO ──────────────────────────────────
export async function deleteOne(key) {
  await minioClient.removeObject(BUCKET, key);
}

export async function deleteMany(keys) {
  await Promise.allSettled(keys.map(k => deleteOne(k)));
}