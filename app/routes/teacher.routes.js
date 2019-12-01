const router = require("express").Router();
const teacher = require("../controllers/teacher.controller")();

router.post("/", teacher.register);
router.get("/", teacher.getAllTeachers);
router.delete("/:mobile", teacher.delete);

module.exports = router;
