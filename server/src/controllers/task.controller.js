const db = require("../config/database");

exports.assignTask = async (req,res)=>{

 const {request_id,assigned_to} = req.body;

 const [result] = await db.query(
  `INSERT INTO tasks
  (request_id,assigned_to,status)
  VALUES(?,?,?)`,
  [request_id,assigned_to,"ASSIGNED"]
 );

 res.json({
  taskId:result.insertId
 });

};


exports.updateTask = async (req,res)=>{

 const {status} = req.body;

 await db.query(
  `UPDATE tasks
  SET status=?
  WHERE id=?`,
  [status,req.params.id]
 );

 res.json({
  message:"updated"
 });

};