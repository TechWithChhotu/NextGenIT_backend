import express from "express";
import { body } from "express-validator";
import { createInquiry } from "../controllers/inquiry.controller.js";
import ProjectModels from "../models/Project.models.js";
const router = express.Router();

// ── LEADS LOGS ROUTE SYSTEM ──
router.post(
  "/inquiries",
  [
    body("name").notEmpty().withMessage("Name component parameter is required"),
    body("email")
      .isEmail()
      .withMessage("Please pass a verified structured email"),
    body("serviceInterest")
      .notEmpty()
      .withMessage("Strategic serviceInterest selection is required"),
    body("estimatedBudget")
      .notEmpty()
      .withMessage("Estimated budget parameters required"),
    body("description")
      .isLength({ min: 10 })
      .withMessage("Project description details must clear 10+ characters"),
  ],
  createInquiry,
);

// ── CASE STUDIES DATA FEED ROUTE SYSTEM ──
router.get("/portfolio", async (req, res, next) => {
  try {
    const projects = await ProjectModels.find({}).sort({ customId: 1 });
    res
      .status(200)
      .json({ success: true, count: projects.length, data: projects });
  } catch (error) {
    next(error);
  }
});

export default router;
