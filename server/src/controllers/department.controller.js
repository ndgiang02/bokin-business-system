const deptService = require("../services/department.service");
const response = require("../utils/response");


exports.getAlldepartments = async (req, res, next) => {
  try {
    const departments = await deptService.getAlldepartments();

    return response.success(res, departments, "Department list");
  } catch (error) {
    next(error);
  }
};

exports.getOne = async (req, res, next) => {
  try {
    const data = await deptService.getDepartmentById(req.params.id);

    return res.json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
};

// ── Tạo ─────────────────────────────────────
exports.create = async (req, res, next) => {
  try {
    const data = await deptService.createDepartment(req.body);

    return res.status(201).json({
      success: true,
      message: "Tạo phòng ban thành công",
      data,
    });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const data = await deptService.updateDepartment(req.params.id, req.body);

    return res.json({
      success: true,
      message: "Cập nhật thành công",
      data,
    });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    await deptService.deleteDepartment(req.params.id);

    return res.json({
      success: true,
      message: "Xóa phòng ban thành công",
    });
  } catch (err) {
    next(err);
  }
};