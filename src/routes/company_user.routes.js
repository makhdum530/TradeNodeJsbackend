import express from "express";
import {
  create,
  getAll,
  login,
  sendEmailVarificationLink,
  update,
  verifyEmail,
} from "../controllers/company_user.controller.js";
import {
  validateCompanyMiddleware,
  validateLoginMiddleware,
} from "../middlewares/companyAuth.js";
import { permissionAdmin } from "../middlewares/permission.js";
const router = express.Router();

router.get("/", validateLoginMiddleware, permissionAdmin(), getAll);
router.put("/:id", validateLoginMiddleware, update);
router.post("/", validateLoginMiddleware, create);

router.post(
  "/sendEmailVarificationLink",
  validateCompanyMiddleware,
  sendEmailVarificationLink
);
router.put("/verifyEmail/:id", validateCompanyMiddleware, verifyEmail);
router.post("/login", validateCompanyMiddleware, login);

export default router;
