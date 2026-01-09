const express = require("express");
const getDashboardAnalytics = require("../controllers/dashboardController");
const { adminOnly, getTokenFromHeaders } = require("../middleware/auth");
const router = express.Router();

router.get(
  "/get-dashboard-analytics",
  getTokenFromHeaders,
  adminOnly,
  getDashboardAnalytics
);

module.exports = router;
