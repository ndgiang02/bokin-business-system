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