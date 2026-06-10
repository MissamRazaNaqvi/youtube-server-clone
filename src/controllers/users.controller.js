import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { userModel } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudnary.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessTokenAndGenerateRefreshToken = async (userId) => {

    try {
        const user = await userModel.findById(userId)
        // console.log(userId, "userId")
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken

        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "something went wrong while generationg refresh and access token")
    }
}

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

const loginUser = asyncHandler(async (req, res) => {

    // get data form user email password 
    // user exist or not 
    //find user in mongo
    // decrypt password and compare 
    // access token and refresh token generate
    // response send cookie
    // console.log(req.body,"fdkfnd")
    const { email, password } = req.body;

    // console.log(email, password, "email, password ")

    if (!email || !password) {
        throw new ApiError(400, "username password is required")
    }

    const userExist = await userModel.findOne({ email });

    if (!userExist) {
        throw new ApiError(400, "user not exist ")
    }
    else{
        console.log(userExist, 'userExist')
    }

    const isPasswordValid = await userExist.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "invalid user credential.")
    }

    const { accessToken, refreshToken } = await generateAccessTokenAndGenerateRefreshToken(userExist._id);

    const loggedInUser = await userModel.findById(userExist._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
        .cookie("accessTokenn", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "User logged In successfully.")
        )
})

const logOutUser = asyncHandler(async (req, res) => {
    // req.user._id 
    console.log(req.body,"req.body")
    await userModel.findByIdAndUpdate(
        req.user._id, {
        $set: {
            refreshToken: undefined
        }
    },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    res.status(200)
    .clearCookie("accessTokenn", accessToken, options)
    .clearCookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, {}, "User Logged Out"))

})

export { registerUser, loginUser, logOutUser }