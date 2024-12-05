const router = express.Router();
import express from "express";

import user from "./user.routes.js";
import company from "./company.routes.js";
import country from "./country.routes.js";

// Define route mappings
router.use("/user", user);
router.use("/company", company);
router.use("/country", country);

export default router;
