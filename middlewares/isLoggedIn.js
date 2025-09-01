function isLoggedIn(req, res, next) {
  if (req.session.user) {
    return next();
  }
  req.flash("error_msg", "Please log in to continue");
  res.redirect("/login");
}

module.exports = isLoggedIn;
