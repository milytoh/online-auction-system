exports.getIndex = (req, res, next) => {
  console.log(req.session)
  res.render("index", { title: "Home", user: req.session.user });
};
