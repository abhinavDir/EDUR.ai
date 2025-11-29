import express from "express";
import { trackAnalytics, getAnalytics } from "../controllers/analyticsController.js";

const router = express.Router();

router.post("/track", trackAnalytics);
router.get("/data", getAnalytics);

export default router;
