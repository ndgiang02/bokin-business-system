const bcrypt = require("bcrypt");
const userModel = require("../models/user.model");
const jwtUtil = require("../utils/jwt");

exports.login = async ({email,password}) => {

  const user = await userModel.findByEmail(email);

  if(!user){
    throw new Error("Tài khoản không tồn tại");
  }

  const valid = await bcrypt.compare(password,user.password);

  if(!valid){
    throw new Error("Mật khẩu không đúng");
  }

  const token = jwtUtil.generateToken({
    id:user.id,
    role:user.role_id
  });

   if (user) {
    delete user.password;
  }

  return {token,user};

};