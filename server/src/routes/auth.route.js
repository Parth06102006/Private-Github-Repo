import Router from 'express';
import { auth, getAccessToken,getUserInfo_Repositories } from '../controllers/auth.controller.js';

const router = Router();

router.route('/auth/github').get(auth);
router.route('/auth/getToken').post(getAccessToken);
router.route('/repo/list').get(getUserInfo_Repositories);


export default router;