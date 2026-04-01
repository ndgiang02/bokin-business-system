const router = require("express").Router();

const controller = require("../controllers/task.controller");

const auth = require("../middlewares/auth.middleware");

router.post("/assign",auth,controller.assignTask);

router.patch("/:id",auth,controller.updateTask);

module.exports = router;