import * as requestService from "../services/request.service.js";
import response from "../utils/response.js";
// 
// POST /api/requests
// Body: multipart/form-data
//   code, title, client, productTypes, priority, deadline,
//   quantity, notes, splitByImage, videoQuality
//   files: files[] (ảnh)
export async function createRequest(req, res, next) {
  try {
    const data = {
      ...JSON.parse(req.body.data),
      createdById: req.user?.id || 1,
    };

    const files = req.files || [];
    const id = await requestService.createRequest(data, files);

    return response.success(res,{id}, "Tạo yêu cầu thành công", 201)

  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {

    console.log("Received create request with body:", req.body); // log body thô
    console.log("Received create request with body:", req.userId); // log body thô

    const data  = req.body;
    const files = req.files || [];
    const result = await requestService.createRequest(data, files);
    res.status(201).json({ success: true, message: 'Tạo yêu cầu thành công', data: result });
  } catch (err) { next(err); }
}
 

// 
// GET /api/requests
// Query: status, priority, createdById, search, page, limit
// 
export async function getAllRequest(req, res, next) {
  try {
    const data = await requestService.getAllRequests(req.query);
    return response.success(res, data, "Lấy dữ liệu thành công", 200)
  } catch (err) {
    next(err);
  }
}

// 
// GET /api/requests/:id
// 
export async function getRequestById(req, res, next) {
  try {
    const Id = req.query.Id;
    const data = await requestService.getRequestById(Id);
    return response.success(res, data, "Lấy dữ liệu thành công", 200)
  } catch (err) {
    next(err);
  }
}


export async function getRequestByDepartment(req, res, next) {
  try {
    const departmentId = req.params.id;
    const data = await requestService.getRequestByDepartment(departmentId);
    return response.success(res, data, "Lấy dữ liệu thành công", 200)
  } catch (err) {
    next(err);
  }
}

// 
// PATCH /api/requests/:id/status
// Body: { status: "APPROVED" | "REJECTED" | "IN_PROGRESS" | "DONE" }
// 
export async function updateRequestStatus(req, res, next) {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'Thiếu status' });

    const request = await requestService.updateRequestStatus(req.params.id, status);
    res.json({ success: true, message: 'Cập nhật trạng thái thành công', data: request });
  } catch (err) {
    next(err);
  }
}

// 
// DELETE /api/requests/:id
// Xóa request + ảnh trên MinIO
// 
export async function deleteRequest(req, res, next) {
  try {
    await requestService.deleteRequest(req.params.id);
    return res.json({ success: true, message: 'Xóa yêu cầu thành công' });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/requests/:id/status
export async function updateStatus(req, res, next) {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'Thiếu status' });
    const data = await requestService.updateStatus(req.params.id, status);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}
 
// POST /api/requests/:id/revision
export async function revision(req, res, next) {
  try {
    const { comment } = req.body;
    if (!comment?.trim()) return res.status(400).json({ error: 'Vui lòng nhập lý do revision' })

    const createdById = req.user?.id || 1;
    const data = await requestService.createRevision(req.params.id, comment, createdById);
    res.json({ success: true, message: 'Đã gửi yêu cầu làm lại', data });
  } catch (err) { next(err); }
}
 
 
// DELETE /api/requests/:id/assign/:userId
export async function removeAssign(req, res, next) {
  try {
    await requestService.removeAssignment(req.params.id, req.params.userId);
    return response.success(res, data, "Đã xóa phân công", 200)
  } catch (err) { next(err); }
}

export async function assign(req, res, next) {
  try {
    
    const { requestId, userIds } = req.body;
    const assignedById = req.user?.id;

    const data = await requestService.assignUsers(requestId, userIds, assignedById);
    return response.success(res, data, "Gán nhân viên thành công", 200)
  } catch (err) { next(err); }
}



//done
export async function completeRequest(req, res, next) {
  try {

    const requestId = parseInt(req.params.id);
    const userId    = req.user?.id || null;

    const notes     = req.body.notes?.trim() || null;
    const files     = req.files ?? [];    
 
    const data = await requestService.completeRequest(requestId, userId, notes, files );
 
    return response.success(res, data, 'Hoàn thành yêu cầu thành công', 200);
  } catch (err) {
    next(err);
  }
}
