const router = express.Router();
import express from 'express';

//COMPANY USER
import company_user from './company_user.routes.js';

import role from './role.routes.js';
import user from './user.routes.js';
import company from './company.routes.js';
import country from './country.routes.js';
import assigned_user from './assigned_user.routes.js';

// Define route mappings

//COMPOANY USER
router.use('/company_user', company_user);

router.use('/role', role);
router.use('/user', user);
router.use('/company', company);
router.use('/country', country);
router.use('/assigned_user', assigned_user);

export default router;
