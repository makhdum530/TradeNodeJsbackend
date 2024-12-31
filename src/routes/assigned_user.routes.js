import express from 'express';
import { assignedUser } from '../controllers/assigned_user.controller.js';
import { validateLoginMiddlewareCompanyAuth } from '../middlewares/companyAuth.js';
import { permissionSuperAdmin } from '../middlewares/permission.js';
const router = express.Router();

// router.get('/', validateLoginMiddleware, permissionSuperAdmin(), getAll);
// router.post('/', validateLoginMiddlewareCompanyAuth, permissionSuperAdmin(), create);
router.post('/', validateLoginMiddlewareCompanyAuth,permissionSuperAdmin(), assignedUser);
// router.post('/sendEmailVarificationLink', validateCompanyMiddleware, sendEmailVarificationLink);
// router.put('/verifyEmail/:id', validateCompanyMiddleware, verifyEmail);
// router.post('/login', validateCompanyMiddleware, login);

export default router;
