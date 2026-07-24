const jwt = require("jsonwebtoken");
const GenerateToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      userEmail: user.userEmail,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    },
  );
};
module.exports = GenerateToken;
