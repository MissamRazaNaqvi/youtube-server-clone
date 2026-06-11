import { userModel } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"

export const verifyJwt = asyncHandler(async (req, res, next) => {
    console.log(req.cookies,"verify")
    try {
        const token = req.cookies?.accessTokenn || req.header("authorization")?.replace("Bearer ", "")

        console.log(token,"token")


        if (!token) {
            return new ApiError(401, "unauthorized request")
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        console.log(decodedToken, "decodedToken")

        const user = await userModel.findById(decodedToken?._id).select("-password -refreshToken")

        console.log(user, "user")

        if (!user) {
            // todo discuss about frontend
            return new ApiError(400, "Invalid Access Token")
        }

        req.user = user;

        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Access Token")
    }

})