import Router from 'express'
import { generateReadme, publishGithub } from '../controllers/readme.controller.js';
import { authHandler } from '../middlewares/auth.middleware.js';

const router = Router();

router.route('/generate/readme').post(authHandler,generateReadme);
router.route('/commit/readme').post(authHandler,publishGithub);

export default router;