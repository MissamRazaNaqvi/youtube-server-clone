import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { userModel } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudnary.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {

    // get user details from frontend 
    // validation - not empty
    // check if user already exist : email 
    // check for images , check for avatar
    // uload images on cloudinary , avatar and cover image
    // create user object - create entry in db
    // remove password from refresh token field from reponse
    // check for user creation
    // return res

    const { username, email, fullname, password } = req.body;

    // console.log(username, email, fullname, password, "body data ")

    // extract file from front
    // console.log(req.files, "avatar")

    if (!username || !email || !fullname || !password) {
        throw new ApiError(400, "All fields are required");
    }

    // const fields = [username, email, fullname, password];

    // if (fields.some(field => !field?.trim())) {
    //   throw new ApiError(400, "All fields are required");
    // }

    const existedUser = await userModel.findOne({ email })

    if (existedUser) {
        // console.log("user already exist with this email")
        throw new ApiError(409, "user already exist with this email")
    }
    //  else {
    //     console.log('you can create new account')
    // }

    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    // console.log(avatarLocalPath,"avatarLocalPath", coverImageLocalPath, "coverImageLocalPath")

    if (!avatarLocalPath) {
        throw new ApiError(400, "avatar file is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    // console.log(avatar,"avatar",coverImage,"coverImage")

    if (!avatar) {
        throw new ApiError(400, "Avatar image is required")
    }

    const user = await userModel.create({
        username: username.toLowerCase(),
        email,
        fullname,
        password,
        avatar: avatar.url || "",
        coverImage: coverImage.url || ""
    });

    // console.log(user, 'user data from mongo')

    const createdUser = await userModel.findById(user._id).select(" -password -refreshToken")
    
    // console.log(createdUser, 'created user data from mongo')

    if (!createdUser) {
        throw new ApiError(500, 'something went working while registring the user')
    }

    res.status(201).json(
        new ApiResponse(200, createdUser, "user register successfully.")
    )
})

export { registerUser }