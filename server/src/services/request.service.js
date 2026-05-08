import sharp                from 'sharp';
import { v4 as uuid }       from 'uuid';
import { minioClient, BUCKET, getPublicUrl } from '../config/minio.js';
import * as requestModel    from '../models/request.model.js';
import { uploadMany, deleteMany } from './upload.service.js';


export async function createRequest(data, files = []) {
  const uploadedFiles = files.length
    ? await uploadMany(files, 'requests')
    : [];
 
  return requestModel.createRequest(data, uploadedFiles);
}


export async function getAllRequests(query) {
  const filters = {
    status:      query.status,
    priority:    query.priority,
    createdById: query.createdById,
    search:      query.search,
    department:  query.department,
    user_id:     query.user_id,
  };
  const pagination = {
    page:  parseInt(query.page)  || 1,
    limit: parseInt(query.limit) || 20,
  };
  return requestModel.getAllRequests(filters, pagination);
}

export async function getRequestById(Id) {
  const request = await requestModel.getRequestById(Id);
  return request;
}

export async function getRequestByDepartment(departmentId) {
  const requests = await requestModel.getRequestByDepartment(departmentId);
  return requests;
}



// ── Đổi status ───────────────────────────────────────────
export async function updateStatus(id, status) {
  await requestModel.getRequestById(id);
  return requestModel.updateStatus(id, status);
}
 
// ── Revision ─────────────────────────────────────────────
export async function createRevision(requestId, comment, createdById) {
  const req = await getRequestById(requestId);
  if (req.status !== 'done') {
    throw Object.assign(new Error('Chỉ có thể revision khi trạng thái là done'), { status: 400 });
  }
  return requestModel.createRevision(requestId, comment, createdById);
}
 
export async function assignUsers(requestId, userIds) {
  return requestModel.assignUsers(requestId, userIds);
}
 
export async function removeAssignment(requestId, userId) {
  return requestModel.removeAssignment(requestId, userId);
}
 
// ── Xóa request + files trên MinIO ───────────────────────
export async function deleteRequest(id) {
  const req = await getRequestById(id);
  if (req.files?.length) {
    await deleteMany(req.files.map(f => f.key));
  }
  return requestModel.deleteRequest(id);
}



export async function completeRequest(requestId, userId, notes, files) {
   
  /*
  const request = await getRequestById(requestId);
    if (!request) throw new AppError('Yêu cầu không tồn tại', 404);
 
    if (request.assigned_to !== userId) {
      throw new AppError('Bạn không có quyền hoàn thành yêu cầu này', 403);
    }
 
    if (request.status !== 'processing') {
      throw new AppError(`Không thể hoàn thành yêu cầu ở trạng thái "${request.status}"`, 400);
    } */
 
    const uploadedFiles = files.length
    ? await uploadMany(files,  `results`)
    : [];
 
    const updated = await requestModel.completeRequest(requestId, userId, notes, uploadedFiles);
 
    return updated;
}
