import express from 'express';
import { login, reqestOTP, resetPassword, signUp } from '../Controllers/userController.js';
import { protect } from '../Middleware/authMiddleware.js';
import { blockAdminCreation } from '../Middleware/blockAdminCreation.js';

const userRouter = express.Router();

userRouter.post('/signUp',protect,blockAdminCreation,signUp);
userRouter.post('/login',protect,login);
userRouter.post("/forget-password/request-otp", reqestOTP);
userRouter.post("/forget-password/reset", resetPassword);

export default userRouter;