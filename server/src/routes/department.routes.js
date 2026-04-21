const router = require("express").Router();
const controller = require("../controllers/department.controller");

router.get("/getAllDepartments",controller.getAlldepartments);
router.get('/:id',   controller.getOne);
router.put('/update/:id',   controller.update);
router.delete('/delete/:id', controller.remove);
router.post("/create", controller.create);


module.exports = router;