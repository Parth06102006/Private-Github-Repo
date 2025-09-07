import Router from 'express'
import { generateReadme, publishGithub } from '../controllers/readme.controller.js';

const router = Router();

router.route('/generate/readme').post(generateReadme);
router.route('/commit/readme').post(publishGithub);

export default router;