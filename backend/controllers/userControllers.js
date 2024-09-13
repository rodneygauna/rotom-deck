import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import User from "../models/userModel.js";

import generateToken from "../utils/generateToken.js";

const SALT = await bcrypt.genSalt(10);

// @desc    Register a new user
// @route   POST /api/v1/users/register
// @access  Public
export const registerUser = asyncHandler(async (req, res) => {
  const { display_name, email, password, is_active, user_role } = req.body;

  // Check if password input is present
  if (!password) {
    res.status(400);
    throw new Error("Password is required");
  }

  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  // Generate a salt and hash the password
  const hashedPassword = await bcrypt.hash(password, SALT);

  // Create new user
  const user = await User.create({
    display_name,
    email,
    password_hash: hashedPassword,
    is_active: is_active || true,
    user_role: user_role || "user",
  });

  // Generate token and send response
  if (user) {
    generateToken(res, user._id);

    res.status(201).json({
      _id: user._id,
      display_name: user.display_name,
      email: user.email,
      is_active: user.is_active,
      user_role: user.user_role,
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// @desc    Auth user & get token
// @route   POST /api/v1/users/auth
// @access  Public
export const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (
    user &&
    user.is_active == true &&
    (await bcrypt.compare(password, user.password_hash))
  ) {
    res.json({
      _id: user._id,
      display_name: user.display_name,
      email: user.email,
      is_active: user.is_active,
      user_role: user.user_role,
      token: generateToken(res, user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

// @desc    Get user profile
// @route   GET /api/v1/users/profile
// @access  Private
export const userProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password_hash");

  if (user) {
    res.status(201).json(user);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Update user profile
// @route   PUT /api/v1/users/profile
// @access  Private
export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  // Check if department exists
  if (req.body.departmentID) {
    if (!mongoose.isValidObjectId(req.body.departmentID)) {
      res.status(400);
      throw new Error("Invalid department ID");
    }
  }

  // Save updated user data
  if (user) {
    const { ...userData } = req.body;

    // Update user data and send response
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { ...userData },
      { new: true }
    );
    res.status(201).json(updatedUser);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Get user by ID
// @route   GET /api/v1/users/:id
// @access  Private
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password_hash");

  if (user) {
    res.status(201).json(user);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});
