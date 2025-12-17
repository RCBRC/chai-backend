import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import User from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
const registerUser = asyncHandler(async (req, res, next) => {
const { fullname, username, email, password } = req.body;
console.log("email:", email);

if (
    [fullname, username, email, password].some((field) => field?.trim() === "") 
){
    throw new ApiError(400, "All fields are required");
}

 const existedUser = await User.findOne({
    $or: [{ email }, { username }],
})
if (existedUser) {
    
    throw new ApiError(409, "User with this email or username already exists");
}
const avatarLocalpath = req.files?.avatar[0]?.path;
const coverImageLocalpath = req.files?.coverImage[0]?.path;
if(!avatarLocalpath){
    throw new ApiError (400, "Avatar is required");
}
 const avatar = await uploadOnCloudinary(avatarLocalpath)
 const coverImage = await uploadOnCloudinary(coverImageLocalpath)
 if(!avatar){
    throw new ApiError (400, "avatar file is required");
 }
   const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
 })
 const createdUser = await User.findById(user._id).select(
    "-password -refreshToken "
 )
 if(!createdUser){
   throw new ApiError(500, "something went wrong while registering  the user");
 }
 return res.status(201).json(
    new ApiResponse(200, createdUser, "User registered successfully")
)
});
export { registerUser };