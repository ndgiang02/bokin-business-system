import sharp                from 'sharp';
import { v4 as uuid }       from 'uuid';
import { minioClient, BUCKET, getPublicUrl } from '../config/minio.js';
import * as requestModel    from '../models/requestModel.js';

// ── Helper: tạo key theo ngày ─────────────────────────────
function generateKey(folder = 'requests') {
  const d    = new Date();
  const date = `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}`;
  return `${folder}/${date}/${uuid()}.jpg`;
}

// ── Helper: compress + upload 1 file buffer lên MinIO ─────
async function uploadToMinio(buffer, originalname) {
  // Compress bằng sharp
  const compressed = await sharp(buffer)
    .resize({ width: 1200, withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toBuffer();

  const key  = generateKey('requests');
  const size = compressed.length;

  // Upload lên MinIO
  await minioClient.putObject(BUCKET, key, compressed, size, {
    'Content-Type':               'image/jpeg',
    'x-amz-meta-original-name':  originalname,
  });

  return {
    key,
    url:      getPublicUrl(key),
    name:     originalname,
    size,
    mimeType: 'image/jpeg',
  };
}

// ─────────────────────────────────────────────────────────
// Tạo request mới
//   data  — body từ request
//   files — mảng file từ multer (req.files)
// ─────────────────────────────────────────────────────────
export async function createRequest(data, files = []) {
  // 1. Upload tất cả ảnh lên MinIO song song
  const uploadedImages = await Promise.all(
    files.map(f => uploadToMinio(f.buffer, f.originalname))
  );

  // 2. Lưu request + đường dẫn ảnh vào MySQL
  const request = await requestModel.createRequest(data, uploadedImages);

  return request;
}

// ─────────────────────────────────────────────────────────
// Lấy danh sách requests (có filter + phân trang)
// ─────────────────────────────────────────────────────────
export async function getRequests(query) {
  const filters = {
    status:      query.status,
    priority:    query.priority,
    createdById: query.createdById,
    search:      query.search,
  };
  const pagination = {
    page:  parseInt(query.page)  || 1,
    limit: parseInt(query.limit) || 20,
  };
  return requestModel.getRequests(filters, pagination);
}

// Lấy 1 request theo id
export async function getRequestById(id) {
  const request = await requestModel.getRequestById(id);
  if (!request) throw Object.assign(new Error('Request không tồn tại'), { status: 404 });
  return request;
}

// Cập nhật trạng thái
export async function updateRequestStatus(id, status) {
  await getRequestById(id);  // check tồn tại
  return requestModel.updateRequestStatus(id, status);
}

// 
// Xóa request: xóa ảnh trên MinIO trước, rồi xóa DB
// 
export async function deleteRequest(id) {
  const request = await getRequestById(id);

  // Xóa từng ảnh trên MinIO song song
  if (request.images?.length) {
    await Promise.allSettled(
      request.images.map(img =>
        minioClient.removeObject(BUCKET, img.key)
      )
    );
  }

  return requestModel.deleteRequest(id);
}