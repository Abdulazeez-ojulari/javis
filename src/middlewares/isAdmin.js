exports.isAdmin = function (req, res, next) {
  let user = req.user;
  if (!user.isAdmin) {
    return res.status(403).json({
      message: "You do not possess the permission to access this route",
    });
  }
  next();
};
