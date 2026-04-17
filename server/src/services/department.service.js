const bcrypt = require("bcrypt");
const deptModel = require("../models/department.model");

exports.getAlldepartments = async () => {

  return await deptModel.getAlldepartments();

};

 
exports.getDepartmentById = async (id) => {
  const dept = await deptModel.getDepartmentById(id);

  if (!dept) {
    throw Object.assign(new Error("Không tìm thấy phòng ban"), { status: 404 });
  }

  return dept;
};

exports.createDepartment = async (data) => {
  const name = data.name?.trim();
  const code = data.code?.trim().toUpperCase();

  if (!name) {
    throw Object.assign(new Error("Thiếu tên phòng ban"), { status: 400 });
  }

  if (code) {
    const exists = await deptModel.codeExists(code);
    if (exists) {
      throw Object.assign(new Error("Mã phòng ban đã tồn tại"), { status: 409 });
    }
  }

  return deptModel.createDepartment({ name, code });
};

exports.updateDepartment = async (id, data) => {
  await exports.getDepartmentById(id);

  const name = data.name?.trim();
  const code = data.code?.trim().toUpperCase();

  if (code) {
    const exists = await deptModel.codeExists(code, id);
    if (exists) {
      throw Object.assign(new Error("Mã phòng ban đã tồn tại"), { status: 409 });
    }
  }

  return deptModel.updateDepartment(id, { name, code });
};


exports.deleteDepartment = async (id) => {
  await exports.getDepartmentById(id);
  return deptModel.deleteDepartment(id);
};