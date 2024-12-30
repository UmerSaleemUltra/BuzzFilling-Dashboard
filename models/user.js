import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    businessName: { type: String, required: true },
    state: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

const User = mongoose.model("User", userSchema);

export default User;
