const router = require("express").Router();
const controller = require("../controllers/dashboard.controller");

router.get('/stats',           controller.getStatsDashBoard);
router.get('/chart',           controller.getChartDashBoard);
router.get('/recent-requests', controller.getRecentDashBoard);
router.get('/activities',      controller.getActiveDashBoard);
router.get('/user-tasks',      controller.getUserTaskDashBoard);

module.exports = router;