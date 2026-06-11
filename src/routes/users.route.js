import { Router } from 'express'
import { changeCurrentPassword, getCurrentUser, logOutUser, loginUser, refreshAccessToken, registerUser, updateAvatar, updateUserDetails } from '../controllers/users.controller.js'
import { upload } from '../middlewares/multer.middleware.js';
import { verifyJwt } from '../middlewares/auth.middleware.js';

const userRouter = Router();

userRouter.route('/register').post(upload.fields(
    [
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]
), registerUser)

userRouter.route('/login').post(loginUser)
userRouter.route('/logout').post(verifyJwt, logOutUser)
userRouter.route('/refresh-token').post(refreshAccessToken)
userRouter.route('/change-password').post(verifyJwt, changeCurrentPassword)
userRouter.route('/current-user').get(verifyJwt, getCurrentUser)
userRouter.route('/user-detail-update').post(verifyJwt, updateUserDetails)
userRouter.route('/update-avatar').post(upload.fields(
    [{
        name: "avatar",
        maxCount: 1
    }]), verifyJwt, updateAvatar)


export { userRouter }