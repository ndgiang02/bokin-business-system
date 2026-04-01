const bcrypt = require("bcrypt");
const model = require("../models/role.model");

exports.getAllRoles = async () => {

  return await model.getAllRoles();

};