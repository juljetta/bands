var express = require("express");
var router = express.Router();

router.use((req, res, next) => {
  if (req.session.currentUser) {
    // <== if there's user in the session (user is logged in)
    next(); // ==> go to the next route ---
  } else {
    //    |
    res.redirect("/auth/login"); //    |
  } //    |
}); // ------------------------------------
//     |
//     V
router.get("/secret", (req, res, next) => {
  res.render("secret");
});

module.exports = router;
