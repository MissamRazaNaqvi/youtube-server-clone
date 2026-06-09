import mongoose from "mongoose";
import bcrypt from "bcryptjs"
import jwt from 'jsonwebtoken'

const userSchema = mongoose.Schema(
    {
        username: {
            type: String,
            unique: true,
            index: true,
            required: true,
            lowercase: true,
            trim: true
        },
        email: {
            type: String,
            unique: true,
            required: true,
            lowercase: true,
            trim: true
        },
        fullname: {
            type: String,
            required: true,
            lowercase: true,
            trim: true
        },
        avatar: {
            type: String, //cloudinar url
            required: true,
        },
        coverImage: {
            type: String, //cloudinar url
        },
        watchHistory: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video"
        }],
        password: {
            type: String,
            required: [true, 'password id required'],
        },
        refreshToken: {
            type: String
        }

    }, {
    timestamp: true
}
)

// pre method run before save data into mongodb
userSchema.pre("save", async function (next) {
    if (!this.isModified('password'))
        return next();

    this.password = bcrypt.hash(this.password, 10);
    next();
})


userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function () {
    return jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username,
        fullname: this.fullname
    },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    )
}

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign({
        _id: this._id,
    },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    )
}

export const userModel = mongoose.model('User', userSchema)