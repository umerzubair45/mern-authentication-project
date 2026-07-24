const ROLE_PERMISSIONS = require("../config/rolePermissions");

const authorizePermission = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required.",
      });
    }

    const userRole = req.user.role;

    const userPermissions = ROLE_PERMISSIONS[userRole] || [];

    const hasPermission = userPermissions.includes(requiredPermission);

    if (!hasPermission) {
      return res.status(403).json({
        message: "Access denied. You do not have permission.",
      });
    }

    next();
  };
};

module.exports = authorizePermission;
