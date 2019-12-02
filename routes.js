const router = require("express").Router();

// Route groups here
router.use("/teacher", require("./app/routes/teacher.routes"));
router.use("/class", require("./app/routes/classes.routes"));

module.exports = router;