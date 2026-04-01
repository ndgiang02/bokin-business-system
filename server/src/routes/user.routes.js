const router = require("express").Router();
const controller = require("../controllers/user.controller");

router.get("/get-all-users",controller.getAllUsers);

router.get("/get-users-department", controller.getUsersDepartment);

router.post("/create-user",controller.createUser);

module.exports = router;