const authService = require("../services/auth.service");
const response = require("../utils/response");

exports.login = async (req,res)=>{

  try{

    const data = await authService.login(req.body);

    return response.success(
      res,
      data,
      "Thành công"
    );

  }catch(err){

    return response.error(
      res,
      err.message,
      401
    );

  }

};