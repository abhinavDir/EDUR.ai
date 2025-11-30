// backend/routes/authRoutes.js
import express from "express";
import { register, login } from "../controllers/authController.js";

const router = express.Router();

// ⭐ FIX: ADD REGISTER ROUTE
router.post("/signup", register);

// LOGIN ROUTE
router.post("/login", login);

export default router;
