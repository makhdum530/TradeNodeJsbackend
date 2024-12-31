import express from 'express';
import { getAll, create, login, sendEmailVarificationLink, update, verifyEmail } from '../controllers/user.controller.js';
import { validateCompanyMiddleware, validateLoginMiddleware } from '../middlewares/auth.js';
import { validateLoginMiddlewareCompanyAuth } from '../middlewares/companyAuth.js';
import { permissionSuperAdmin } from '../middlewares/permission.js';
const router = express.Router();

router.get('/', validateLoginMiddleware, permissionSuperAdmin(), getAll);
router.post('/', validateLoginMiddlewareCompanyAuth, permissionSuperAdmin(), create);
router.put('/:id', validateLoginMiddleware, update);
router.post('/sendEmailVarificationLink', validateCompanyMiddleware, sendEmailVarificationLink);
router.put('/verifyEmail/:id', validateCompanyMiddleware, verifyEmail);
router.post('/login', validateCompanyMiddleware, login);

export default router;
