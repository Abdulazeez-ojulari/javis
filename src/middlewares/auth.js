const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const token = req.header("Authorization");
  if (!token)
    return res.status(401).send({ message: "Access denied no token provided" });

  try {
    let authToken = token.trim().split(" ");
    if (authToken[0] !== "Bearer") {
      res.status(400).send({ messsage: "wrong auth type" });
    }
    
    const decoded = jwt.verify(authToken[1], process.env.ENIF_SECRET);
    
    if (decoded.isVerified) {
      req.user = decoded;
      next();
    } else {
      res.status(400).send({ messsage: "User not verified" });
    }
  } catch (err) {
    res.status(401).send({ message: "Invalid token provided" });
  }
};
