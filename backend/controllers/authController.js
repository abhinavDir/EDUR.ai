import User from "../models/User.js";
import bcrypt from "bcryptjs";

// ---------------------------
// REGISTER USER
// ---------------------------
export const register = async (req, res) => {
  try {
    const { name, email, password, mobile, purpose } = req.body;

    // Check existing user
    const existing = await User.findOne({ email });
    if (existing) {
      return res.json({ status: false, message: "Email already registered" });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await User.create({
      name,
      email,
      password: hashed,
      mobile,
      purpose,
    });

    // ⭐ Send full user including _id
    return res.json({
      status: true,
      message: "Registration successful",
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        mobile: newUser.mobile,
        purpose: newUser.purpose,
        avatarUrl: newUser.avatarUrl,
      },
    });

  } catch (err) {
    return res.json({ status: false, message: err.message });
  }
};

// ---------------------------
// LOGIN USER
// ---------------------------
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ status: false, message: "User not found" });
    }

    // Match password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ status: false, message: "Incorrect password" });
    }

    // ⭐ Send full user including _id
    return res.json({
      status: true,
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        purpose: user.purpose,
        avatarUrl: user.avatarUrl,
      },
    });

  } catch (err) {
    return res.json({ status: false, message: err.message });
  }
};
