const router = require("express").Router();
const controller = require("../controllers/department.controller");

router.get("/getAllDepartments",controller.getAlldepartments);

module.exports = router;