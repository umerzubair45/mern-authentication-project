const jwt = require("jsonwebtoken");
const GenerateToken = (user) => {
  console.log(user._id);
  return jwt.sign(
    {
      userId: user._id,
      userEmail: user.userEmail,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    },
  );
};
module.exports = GenerateToken;
