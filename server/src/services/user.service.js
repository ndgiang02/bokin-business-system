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