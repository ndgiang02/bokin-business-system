const router = require("express").Router();

const controller = require("../controllers/request.controller");

const auth = require("../middlewares/auth.middleware");

router.get("/",auth,controller.getRequests);

router.post("/",auth,controller.createRequest);

module.exports = router;