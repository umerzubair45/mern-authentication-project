const crypto = require("crypto");

const generateVerificationToken = () => {
  return {
    verificationToken: crypto.randomBytes(32).toString("hex"),
    verificationTokenExpires: new Date(Date.now() + 15 * 60 * 1000),
  };
};

module.exports = generateVerificationToken;
