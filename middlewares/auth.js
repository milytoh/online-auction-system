exports.isAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  next();
};

exports.isSeller = (req, res, next) => {
  if (req.session.user?.role !== "seller") return res.send("Access denied");
  next();
};
