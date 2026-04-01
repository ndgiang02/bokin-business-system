const jwt = require("jsonwebtoken");

module.exports = function(req, res, next) {

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {

    const decoded = jwt.verify(token, "secret");
    req.user = decoded;
    next();

  } catch (err) {

        next(error);

  }
};

const jwt = require("jsonwebtoken");

module.exports = function authMiddleware(req, res, next) {

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized"
    });
  }

  const token = authHeader.split(" ")[1];

  try {

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();

  } catch (err) {

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token"
    });

  }
};