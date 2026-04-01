const bcrypt = require("bcrypt");
const model = require("../models/department.model");

exports.getAlldepartments = async () => {

  return await model.getAlldepartments();

};