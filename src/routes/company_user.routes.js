import express from 'express';
import {getById, create, getAll, login, sendEmailVarificationLink, update, verifyEmail } from '../controllers/company_user.controller.js';
import { validateCompanyMiddlewareCompanyAuth, validateLoginMiddlewareCompanyAuth } from '../middlewares/companyAuth.js';
import { permissionAdminAndSA } from '../middlewares/permission.js';
const router = express.Router();

router.get('/', validateLoginMiddlewareCompanyAuth, permissionAdminAndSA(), getAll);
router.put('/:id', validateLoginMiddlewareCompanyAuth, update);
router.get('/:id', validateLoginMiddlewareCompanyAuth,permissionAdminAndSA(), getById);
router.post('/', validateLoginMiddlewareCompanyAuth, create);
router.post('/sendEmailVarificationLink', validateCompanyMiddlewareCompanyAuth, sendEmailVarificationLink);
router.put('/verifyEmail/:id', validateCompanyMiddlewareCompanyAuth, verifyEmail);
router.post('/login', validateCompanyMiddlewareCompanyAuth, login);

export default router;
