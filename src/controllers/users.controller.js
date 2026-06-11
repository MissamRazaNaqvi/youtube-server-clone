import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { userModel } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudnary.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"


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
    else {
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
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "User logged In successfully.")
        )
})

const logOutUser = asyncHandler(async (req, res) => {
    // console.log(req.user._id, 'req.user._id ')

    await userModel.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            returnDocument: true
        }
    )
    const { accessToken, refreshToken } = await generateAccessTokenAndGenerateRefreshToken(req.user._id);

    const options = {
        httpOnly: true,
        secure: true
    }

    res.status(200)
        .clearCookie("accessToken", accessToken, options)
        .clearCookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, {}, "User Logged Out"))

})
// currently not working need to fix in future
const refreshAccessToken = asyncHandler(async (req, res) => {
    // get 

    console.log(req.cookies, "req.cookies")

    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken

    console.log(incomingRefreshToken, "incomingRefreshToken");

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorised request")
    }

    const decodedRefreshToken = jwt.verfy(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

    if (!decodedRefreshToken) {
        throw new ApiError(401, "unauthorised token")
    }

    const user = await userModel.findById(decodedRefreshToken._id)

    console.log(user, "*****user=====")

    if (!user) {
        throw new ApiError(401, "invalid Refresh Token")
    }

    if (incomingRefreshToken !== user?.refreshToken) {
        throw new ApiError(401, "Refresh Token is expired or usedd")
    }
    const options = {
        httpOnly: true,
        secure: true
    }
    const { accessToken, newRefreshToken } = await generateAccessTokenAndGenerateRefreshToken(user._id)

    return res.status(200)
        .cookie("accessToken", accessToken)
        .cookie("refreshToken", newRefreshToken)
        .json(
            new ApiResponse(200, { accessToken, newRefreshToken }, "access token refrshed")
        )


})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body

    // console.log(oldPassword, newPassword)

    // const user = req.user;

    const user = await userModel.findById(req.user?._id)

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(200, "credential invalid")
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false })

    return res.status(200).json(new ApiResponse(200, {}, "password change successfull."))

    // console.log(user,"user from change current password")
})

const getCurrentUser = asyncHandler(async (req, res) => {

    // const user = await userModel.findById(req.user?._id)

    return res.status(200).json(new ApiResponse(200, { user: req.user }, "current user data"))

})

const updateUserDetails = asyncHandler(async (req, res) => {
    const { fullname, email } = req.body;

    if (!fullname || !email) {
        throw new ApiError(400, "Full name and email are required");
    }

    const user = await userModel.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullname,
                email
            }
        },
        {
            returnDocument: "after",
            runValidators: true
        }
    ).select("-password -refreshToken");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            user,
            "Account details updated successfully"
        )
    );
});

const updateAvatar = asyncHandler(async (req, res) => {
    // Get local file path

    console.log(req.files,"req.file")
    const avatarLocalPath = req.files?.avatar[0]?.path;

    console.log(avatarLocalPath,"avatarLocalPath")

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar image is required");
    }

    // Upload to Cloudinary
    const uploadedAvatar = await uploadOnCloudinary(avatarLocalPath);

    if (!uploadedAvatar?.url) {
        throw new ApiError(400, "Error while uploading avatar");
    }

    // Update user avatar
    const avatar = await userModel
        .findByIdAndUpdate(
            req.user?._id,
            {
                $set: {
                    avatar: uploadedAvatar.url,
                },
            },
            {
                new: true, // return updated document
                runValidators: true,
            }
        )
        .select("-password -refreshToken");

    if (!avatar) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            avatar,
            "Avatar Updated Successfully"
        )
    );
});


export { registerUser, loginUser, logOutUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateUserDetails, updateAvatar }