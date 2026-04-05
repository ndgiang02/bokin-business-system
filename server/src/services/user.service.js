const bcrypt = require("bcrypt");
const userModel = require("../models/user.model");

exports.createUser = async (data) => {

  const hash = await bcrypt.hash(data.password,10);

  const user = {
    ...data,
    password: hash
  };

  return await userModel.createUser(user);

};

exports.getAllUsers = async () => {

  return await userModel.getAllUsers();

};

exports.getUsersDepartment = async (Id) => {

  return await userModel.getUsersDepartment(Id);

};

exports.updateUser = async (id, data) => {
  await getUserById(id);

  if (data.email) {
    const exists = await userModel.emailExists(data.email, id);
    if (exists) {
      throw Object.assign(new Error('Email đã tồn tại'), { status: 409 });
    }
  }

  const updateData = {};

  if (data.name) {
    updateData.name = data.name.trim();
  }

  if (data.email) {
    updateData.email = data.email.trim().toLowerCase();
  }

  if (data.role_id) {
    updateData.role_id = data.role_id;
  }

  if (data.department_id) {
    updateData.department_id = data.department;
  }

  if (data.password) {
    updateData.password = await bcrypt.hash(data.password, SALT_ROUNDS);
  }

  if (data.phone) {
    updateData.phone = data.phone.trim();
  }




  return userModel.updateUser(id, updateData);
};

exports.deleteUser = async (id, currentUserId) => {
  await getUserById(id);

  // Không cho tự xóa chính mình
  if (parseInt(id) === parseInt(currentUserId)) {
    throw Object.assign(
      new Error('Không thể xóa tài khoản đang đăng nhập'),
      { status: 400 }
    );
  }

  return userModel.deleteUser(id);
};

const getUserById = async (id) => {
  const user = await userModel.getUserById(id);

  if (!user) {
    throw Object.assign(
      new Error('User không tồn tại'),
      { status: 404 }
    );
  }

  return user;
};

exports.getUserById = getUserById;