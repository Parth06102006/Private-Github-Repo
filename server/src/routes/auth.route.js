import Router from 'express';
import { auth, getAccessToken,getRepositories } from '../controllers/auth.controller.js';

const router = Router();

router.route('/auth/github').get(auth);
router.route('/auth/getToken').post(getAccessToken);
router.route('/info/repo').get(getRepositories);

export default router;