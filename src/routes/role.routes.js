import express from 'express';
import { create, getAll, remove, update } from '../controllers/role.controller.js';
import { validateLoginMiddleware } from '../middlewares/auth.js';
import { permissionSuperAdmin } from '../middlewares/permission.js';
const router = express.Router();

router.get('/', validateLoginMiddleware, getAll);
router.put('/:id', validateLoginMiddleware, update);
router.post('/', validateLoginMiddleware, create);
router.delete('/:id', validateLoginMiddleware, remove);

export default router;
