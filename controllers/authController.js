import User from "../models/User.js";
import World from "../models/World.js";

export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 1. Create user
    const user = new User({
      username,
      email,
      password, // (hash later)
    });

    const savedUser = await user.save();

    // 2. Create default world for user
    const world = new World({
      owner: savedUser._id,
      name: `${username}'s World`,
      mood: "dreamy",
      stars: true,
      clouds: true,
      aurora: true,
      fantasyLevel: 50,
      dreamIntensity: 50,
    });

    await world.save();

    res.status(201).json({
      message: "Profile created",
      user: {
        id: savedUser._id,
        username: savedUser.username,
        email: savedUser.email,
      },
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({ message: "Registration failed" });
  }
};
