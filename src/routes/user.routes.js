import express from 'express';
import { getAll, getByIdCompanyUser, getByIdUser, login, register, update, verifyEmail } from '../controllers/user.controller.js';
import { validateCompanyMiddleware, validateLoginMiddleware } from '../middlewares/auth.js';
import { permissionSuperAdmin } from '../middlewares/permission.js';
import { validateLoginMiddlewareCompanyAuth } from '../middlewares/companyAuth.js';
const router = express.Router();

router.get('/', validateLoginMiddlewareCompanyAuth, permissionSuperAdmin(), getAll); //by company owner
// router.post('/', validateLoginMiddlewareCompanyAuth, permissionSuperAdmin(), create);
router.put('/:id', validateLoginMiddleware, update);
router.get('/:id', validateLoginMiddlewareCompanyAuth, getByIdCompanyUser); //company user auth check
router.get('/getByIdUser/:id', validateLoginMiddleware, getByIdUser); //customer/user auth check
router.post('/register', validateCompanyMiddleware, register);
router.put('/verifyEmail/:id', validateCompanyMiddleware, verifyEmail);
router.post('/login', validateCompanyMiddleware, login);

export default router;
