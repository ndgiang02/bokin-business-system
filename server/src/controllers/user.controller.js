const userService = require("../services/user.service");
const response = require("../utils/response");

exports.createUser = async (req,res, next)=>{

  try{
    const id = await userService.createUser(req.body);
    return response.success(res,{ id }, "Tạo người dùng thành công", 201);

  }catch(err){
    next(err);
  }

};


exports.getAllUsers = async (req, res, next) => {
  try {

    const users = await userService.getAllUsers();

    return response.success(res, users, "User list");

  } catch (error) {
    next(error);
  }
};

exports.getUsersDepartment = async (req, res, next) => {
  try {
    const departmentId = req.query.departmentId ? parseInt(req.query.departmentId): undefined;

    const users = await userService.getUsersDepartment(departmentId);

    return response.success(res, users, "User list by department");
  } catch (error) {
    next(error);
  }
}; 

exports.getUserById = async (req, res, next) => {
  try {
    const data = await userService.getUserById(req.params.id);
    return response.success(res, data, "User details");
  } catch (err) {
    next(err);
  }
};


// PUT /api/users/:id
exports.update = async (req, res, next) => {
  try {
    const data = await userService.updateUser(req.params.id, req.body);
    return response.success(res, data, "Cập nhật thành công");
  } catch (err) {
    next(err);
  }
};

// DELETE /api/users/:id
exports.remove = async (req, res, next) => {
  try {
    const currentUserId = req.user?.id;
    await userService.deleteUser(req.params.id, currentUserId);
    return response.success(res, null, "Xóa tài khoản thành công");
  } catch (err) {
    next(err);
  }
};