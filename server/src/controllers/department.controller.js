const userService = require("../services/department.service");
const response = require("../utils/response");


exports.getAlldepartments = async (req, res, next) => {
  try {

    const users = await userService.getAlldepartments();

    return response.success(res, users, "Department list");

  } catch (error) {
    next(error);
  }
};