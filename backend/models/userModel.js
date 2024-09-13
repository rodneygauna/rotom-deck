import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // User Profile
    display_name: {
      type: String,
      required: [true, "Display name is required"],
    },
    // User Email and Password Hash
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
    },
    password_hash: {
      type: String,
      required: [true, "Password is required"],
    },
    // User Status
    is_active: {
      type: Boolean,
      default: true,
    },
    // User Role
    user_role: {
      type: String,
      enum: {
        values: ["user", "super user", "admin"],
        message:
          "{VALUE} is not supported; only user, super user, or admin are allowed.",
      },
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);
