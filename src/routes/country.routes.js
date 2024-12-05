import express from "express";
import { getAll } from "../controllers/country.controller.js";
import { validateLoginMiddleware } from "../middlewares/auth.js";
const router = express.Router();

router.get("/", validateLoginMiddleware, getAll);

export default router;
