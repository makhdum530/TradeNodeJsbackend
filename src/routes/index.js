const router = express.Router();

import express from "express";
import user from "./user.routes.js";

// Define route mappings
router.use("/user", user);

export default router;
