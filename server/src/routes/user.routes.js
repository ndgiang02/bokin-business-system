const router = require("express").Router();
const controller = require("../controllers/user.controller");

router.get("/get-all-users",controller.getAllUsers);

router.get("/get-users-department", controller.getUsersDepartment);

router.post("/create-user",controller.createUser);

router.get("/get-user-byId/:id", controller.getUserById);
router.put("/update-user/:id", controller.update);
router.delete("/delete-user/:id", controller.remove);

module.exports = router;