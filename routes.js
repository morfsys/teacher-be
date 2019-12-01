const router = require("express").Router();

// Route groups here
router.use("/teacher", require("./app/routes/teacher.routes"));

module.exports = router;