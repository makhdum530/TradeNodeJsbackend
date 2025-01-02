import express from 'express';
import { dashboard } from '../controllers/dashboard.controller.js';
import { validateLoginMiddlewareCompanyAuth } from '../middlewares/companyAuth.js';
const router = express.Router();

router.get('/', validateLoginMiddlewareCompanyAuth, dashboard);

export default router;
