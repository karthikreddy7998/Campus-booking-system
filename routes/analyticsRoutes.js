const express = require("express");
const router = express.Router();
const { getAnalytics, getAIInsights } = require("../controllers/analyticsController");

router.get("/", getAnalytics);
router.get("/ai-insights", getAIInsights);

module.exports = router;
