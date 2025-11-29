// backend/routes/userRoutes.js
import express from "express";
import { getProfile, updateProfile } from "../controllers/userController.js";

const router = express.Router();

// GET logged-in user (optional auth middleware)
router.get("/profile", getProfile);

// UPDATE profile
router.patch("/update", updateProfile);

export default router;
