import express from "express";
import {
  getAll,
  login,
  sendEmailVarificationLink,
  verifyEmail,
} from "../controllers/user.controller.js";
import { validateCompanyMiddleware, validateLoginMiddleware } from "../middlewares/auth.js";
const router = express.Router();

router.get("/",validateLoginMiddleware, getAll);
router.post(
  "/sendEmailVarificationLink",
  validateCompanyMiddleware,
  sendEmailVarificationLink
);
router.put("/verifyEmail/:id", validateCompanyMiddleware, verifyEmail);
router.post("/login", validateCompanyMiddleware, login);

export default router;
