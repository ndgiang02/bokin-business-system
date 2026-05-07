const router = require("express").Router();

const controller = require("../controllers/request.controller");
const { isAllowedMime } = require("../services/upload.service");
const authMiddleware = require("../middlewares/auth.middleware");

const multer = require("multer");

//const upload = multer({storage: multer.memoryStorage(),});

const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 100 * 1024 * 1024, files: 20 },
  fileFilter: (req, file, cb) => {
    if (!isAllowedMime(file.mimetype)) {
      return cb(new Error(`Định dạng không hỗ trợ: ${file.mimetype}`));
    }
    cb(null, true);
  },
});

const auth = require("../middlewares/auth.middleware");

router.get("/get-all-requests",controller.getAllRequest);

router.post('/create-request',   upload.array('files', 20), controller.create);

router.get("/get-request-byId",controller.getRequestById);


router.post('/assign-request', auth, controller.assign);



// Status
router.patch('/:id/status', controller.updateStatus);
 
// Revision — chưa ưng làm lại
router.post('/:id/revision', authMiddleware, controller.revision);
 
// Assign nhân viên SX
router.post('/:id/assign',               controller.assign);
router.delete('/:id/assign/:userId',     controller.removeAssign);
 
// Xóa
router.delete('/:id', controller.deleteRequest);

router.post('/:id/complete',  upload.array('files', 20), controller.completeRequest);

module.exports = router;