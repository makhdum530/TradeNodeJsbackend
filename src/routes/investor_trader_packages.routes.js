import express from 'express';
import { create, getAll, remove, update } from '../controllers/investor_trader_packages.controller.js';
import { validateLoginMiddlewareCompanyAuth } from '../middlewares/companyAuth.js';
import { permissionSuperAdmin } from '../middlewares/permission.js';
const router = express.Router();

router.get('/', validateLoginMiddlewareCompanyAuth, permissionSuperAdmin(), getAll);
router.put('/:id', validateLoginMiddlewareCompanyAuth, permissionSuperAdmin(), update);
router.post('/', validateLoginMiddlewareCompanyAuth, permissionSuperAdmin(), create);
router.delete('/:id', validateLoginMiddlewareCompanyAuth, permissionSuperAdmin(), remove);

export default router;
