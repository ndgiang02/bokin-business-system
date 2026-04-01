const roleService = require("../services/role.service");
const response = require("../utils/response");


exports.getAllRoles = async (req, res, next) => {
  try {

    const roles = await roleService.getAllRoles();

    return response.success(res, roles, "Roles list");

  } catch (error) {
    next(error);
  }
};