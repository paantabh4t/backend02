import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler (async (requestAnimationFrame, res) => {
    //get user details from frontend
    //calidations- check empty
    //check if user already exists: email or username should be unique
    //check for images, check for avatar
    //upload them to cloudinary, avatar
    //create user object- create entry in db
    //remove password and refreshtoken field form response
    //check for user creation
    //return response


    const {username,fullName, password, email} =req.body
    console.log("email:",email);

    // if(fullName=== ""){
    //     throw new ApiError(400, "fullname is required")
    // }
    //if else can be used to check each field but its repetitive

    if(
        [username,fullName, password, email].some((field) => field?.trim() ==="")
    ){
        throw new ApiError(400, "all fields are required")
    }


    const existedUser = User.findOne({
        $or: [{email}, {username}]
    })
    if(existedUser){
        throw new ApiError(409, "User with email or username already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath= req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(400, "avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400, "avatar file is required")
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        //we dont know if cover img is sent by the user or not
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(createdUser){
        throw new ApiError (500, "something went wrong while registering a user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "user registered successfully")
    )


})

export {registerUser}