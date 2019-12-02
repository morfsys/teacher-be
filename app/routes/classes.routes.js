const router = require("express").Router();
const classes = require("../controllers/classes.controller")();

router.post("/", classes.create);
router.get("/", classes.get);
router.get("/:id", classes.get);
router.delete("/:title", classes.delete);
router.put('/:id/item', classes.addItem)
module.exports = router;
