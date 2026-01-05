import World from "../models/World.js";

export default async function ownerOnly(req, res, next) {
  const world = await World.findById(req.params.worldId);

  if (!world || world.owner.toString() !== req.user.id) {
    return res.status(403).json({ message: "Access denied" });
  }

  next();
}
