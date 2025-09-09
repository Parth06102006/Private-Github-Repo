import Router from 'express';
import { auth, checkAuth, getAccessToken,getUserInfo_Repositories, logout } from '../controllers/auth.controller.js';
import { authHandler } from '../middlewares/auth.middleware.js';

const router = Router();

router.route('/auth/github').get(auth);
router.route('/auth/check').get(authHandler,checkAuth);
router.route('/auth/logout').get(authHandler,logout);
router.route('/auth/getToken').post(getAccessToken);
router.route('/repo/list').get(authHandler,getUserInfo_Repositories);


export default router;