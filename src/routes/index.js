import express from 'express';
import user from './user.routes.js';

const router = express.Router();

// Define route mappings
router.use('/user', user);

export default router;
