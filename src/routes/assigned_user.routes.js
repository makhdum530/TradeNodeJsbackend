import express from 'express';
import { assignedUser,getAll } from '../controllers/assigned_user.controller.js';
import { validateLoginMiddlewareCompanyAuth } from '../middlewares/companyAuth.js';
import { permissionSuperAdmin } from '../middlewares/permission.js';
const router = express.Router();

router.post('/', validateLoginMiddlewareCompanyAuth, permissionSuperAdmin(), assignedUser);
router.get('/', validateLoginMiddlewareCompanyAuth, getAll);

export default router;
