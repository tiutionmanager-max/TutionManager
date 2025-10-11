export const blockAdminCreation = (req, res, next) => {
  if (req.body.role && req.body.role.toLowerCase() === "admin") {
    return res.status(403).json({
      message: "You are not allowed to create an admin account.",
    });
  }
  next();
};
