const crypto = require("crypto");

const generateVerificationToken = () => {
  return {
    verificationToken: crypto.randomBytes(32).toString("hex"),
    verificationTokenExpires: Date.now() + 1 * 60 * 1000,
  };
};

module.exports = generateVerificationToken;
