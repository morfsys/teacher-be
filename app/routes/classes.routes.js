const router = require("express").Router();
const classes = require("../controllers/classes.controller")();

router.post("/", classes.create);

module.exports = router;
