const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET || "super_secret_key_123";

/**
 * Generate JWT token
 */
exports.generateToken = (payload) => {

  return jwt.sign(
    payload,
    SECRET,
    {
      expiresIn: "1d"
    }
  );

};


/**
 * Verify JWT token
 */
exports.verifyToken = (token) => {

  try {

    return jwt.verify(token, SECRET);

  } catch (err) {

    return null;

  }

};