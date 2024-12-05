import express from "express";
import { update } from "../controllers/company.controller.js";
import { validateLoginMiddleware } from "../middlewares/auth.js";
import { permissionSuperAdmin } from "../middlewares/permission.js";
const router = express.Router();

router.put("/:id", validateLoginMiddleware, permissionSuperAdmin(), update);

export default router;
