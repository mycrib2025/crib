import User from "../models/User.js";
import World from "../models/World.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/* =========================
   REGISTER
========================= */
export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check existing user
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Username or email already exists"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    // Create default world
    await World.create({
      owner: user._id,
      name: `${username}'s World`,
      mood: "dreamy",
      stars: true,
      clouds: true,
      aurora: true,
      fantasyLevel: 50,
      dreamIntensity: 50,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({ message: "Registration failed" });
  }
};

/* =========================
   LOGIN
========================= */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Create token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ message: "Login failed" });
  }
};
