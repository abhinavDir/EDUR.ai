import User from "../models/User.js";

// GET profile
export const getProfile = async (req, res) => {
  try {
    // If using auth middleware
    if (req.user) {
      return res.json({ status: true, user: req.user });
    }

    // If NOT using auth middleware (fallback)
    const userId = req.query.userId;
    if (!userId) return res.json({ status: false, message: "User not found" });

    const user = await User.findById(userId);
    res.json({ status: true, user });

  } catch (err) {
    res.json({ status: false, message: err.message });
  }
};

// UPDATE profile
export const updateProfile = async (req, res) => {
  try {
    const { userId, name, mobile, purpose, avatarUrl } = req.body;

    if (!userId) {
      return res.status(400).json({ status: false, message: "userId missing" });
    }

    const updated = await User.findByIdAndUpdate(
      userId,
      { name, mobile, purpose, avatarUrl },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    return res.json({ status: true, user: updated });

  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};
