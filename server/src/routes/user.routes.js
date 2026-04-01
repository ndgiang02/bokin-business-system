const router = require("express").Router();
const controller = require("../controllers/user.controller");

router.get("/getAllUsers",controller.getAllUsers);
router.post("/create-user",controller.createUser);

module.exports = router;