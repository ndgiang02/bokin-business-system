const router = require("express").Router();
const controller = require("../controllers/role.controller");

router.get("/getAllRoles",controller.getAllRoles);

module.exports = router;