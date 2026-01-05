import User from "../models/User.js";

/**
 * GET USER PROFILE
 */
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("followers following", "username avatar");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * FOLLOW USER
 */
export const followUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user.id;

    const targetUser = await User.findById(targetUserId);

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🔒 PRIVATE ACCOUNT → FOLLOW REQUEST
    if (targetUser.isPrivate) {
      if (!targetUser.followRequests.includes(currentUserId)) {
        targetUser.followRequests.push(currentUserId);
        await targetUser.save({ validateBeforeSave: false });
      }
      return res.json({ message: "Follow request sent" });
    }

    // 🌍 PUBLIC ACCOUNT → DIRECT FOLLOW
    await User.findByIdAndUpdate(currentUserId, {
      $addToSet: { following: targetUserId },
    });

    await User.findByIdAndUpdate(targetUserId, {
      $addToSet: { followers: currentUserId },
    });

    res.json({ message: "User followed" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * ACCEPT FOLLOW REQUEST
 */
export const acceptFollowRequest = async (req, res) => {
  try {
    const { requesterId } = req.body;
    const currentUserId = req.user.id;

    await User.findByIdAndUpdate(currentUserId, {
      $pull: { followRequests: requesterId },
      $addToSet: { followers: requesterId },
    });

    await User.findByIdAndUpdate(requesterId, {
      $addToSet: { following: currentUserId },
    });

    res.json({ message: "Follow request accepted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * REJECT FOLLOW REQUEST
 */
export const rejectFollowRequest = async (req, res) => {
  try {
    const { requesterId } = req.body;
    const currentUserId = req.user.id;

    await User.findByIdAndUpdate(currentUserId, {
      $pull: { followRequests: requesterId },
    });

    res.json({ message: "Follow request rejected" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
