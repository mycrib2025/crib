import jwt from "jsonwebtoken";

export default function auth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔐 attach user to request
    req.user = { id: decoded.id };

    next();
  } catch (error) {
    console.error("AUTH ERROR:", error.message);
    return res.status(401).json({ message: "Invalid token" });
  }
}
