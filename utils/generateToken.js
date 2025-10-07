const crypto = require("crypto");

exports.generateResetToken = () => {
  const token = crypto.randomBytes(32).toString("hex");
  const expiry = Date.now() + 1000 * 60 * 10; 
  return { token, expiry };
};
