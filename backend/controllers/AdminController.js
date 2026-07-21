const adminDashboard = async (req, res) => {
  try {
    return res.status(200).json({
      message: "Welcome to Admin Dashboard.",
      user: {
        _id: req.user._id,
        userName: req.user.userName,
        userEmail: req.user.userEmail,
        role: req.user.role,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
module.exports = adminDashboard;
