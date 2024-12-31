import express from 'express';
import {getById, create, getAll, login, sendEmailVarificationLink, update, verifyEmail } from '../controllers/company_user.controller.js';
import { validateCompanyMiddlewareCompanyAuth, validateLoginMiddlewareCompanyAuth } from '../middlewares/companyAuth.js';
import { permissionAdmin } from '../middlewares/permission.js';
const router = express.Router();

router.get('/', validateLoginMiddlewareCompanyAuth, permissionAdmin(), getAll);
router.put('/:id', validateLoginMiddlewareCompanyAuth, update);
router.get('/:id', validateLoginMiddlewareCompanyAuth,permissionAdmin(), getById);
router.post('/', validateLoginMiddlewareCompanyAuth, create);
router.post('/sendEmailVarificationLink', validateCompanyMiddlewareCompanyAuth, sendEmailVarificationLink);
router.put('/verifyEmail/:id', validateCompanyMiddlewareCompanyAuth, verifyEmail);
router.post('/login', validateCompanyMiddlewareCompanyAuth, login);

export default router;
