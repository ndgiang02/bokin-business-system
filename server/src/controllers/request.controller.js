const db = require("../config/database");

exports.createRequest = async (req,res)=>{

 const {title,description,deadline} = req.body;

 const [result] = await db.query(
  `INSERT INTO requests
  (title,description,deadline,created_by,status)
  VALUES(?,?,?,?,?)`,
  [title,description,deadline,req.user.id,"PENDING"]
 );

 res.json({
  id:result.insertId
 });

};


exports.getRequests = async (req,res)=>{

 const [rows] = await db.query(`
  SELECT r.*,u.name
  FROM requests r
  LEFT JOIN users u
  ON r.created_by = u.id
 `);

 res.json(rows);

};

import * as requestService from '../services/requestService.js';

// 
// POST /api/requests
// Body: multipart/form-data
//   code, title, client, productTypes, priority, deadline,
//   quantity, notes, splitByImage, videoQuality
//   files: files[] (ảnh)
//
export async function create(req, res, next) {
  try {
    const data = {
      ...req.body,
      createdById: req.user?.id || 1,   // lấy từ auth middleware
    };

    const files = req.files || [];

    const request = await requestService.createRequest(data, files);

    res.status(201).json({
      success: true,
      message: 'Tạo yêu cầu thành công',
      data:    request,
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/requests
// Query: status, priority, createdById, search, page, limit
export async function getAll(req, res, next) {
  try {
    const result = await requestService.getRequests(req.query);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

// 
// GET /api/requests/:id
// 
export async function getOne(req, res, next) {
  try {
    const request = await requestService.getRequestById(req.params.id);
    res.json({ success: true, data: request });
  } catch (err) {
    next(err);
  }
}

// 
// PATCH /api/requests/:id/status
// Body: { status: "APPROVED" | "REJECTED" | "IN_PROGRESS" | "DONE" }
// 
export async function updateStatus(req, res, next) {
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
export async function remove(req, res, next) {
  try {
    await requestService.deleteRequest(req.params.id);
    res.json({ success: true, message: 'Xóa yêu cầu thành công' });
  } catch (err) {
    next(err);
  }
}