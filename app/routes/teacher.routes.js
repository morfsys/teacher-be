const router = require("express").Router();
const teacher = require("../controllers/teacher.controller")();

router.post("/", teacher.register);
router.get("/", teacher.getAllTeachers);
router.delete("/:mobile", teacher.delete);
router.post("/:id/availabilty", teacher.setWeekDays);
router.put("/:id/uavailabilty", teacher.setUnavailableTime);
router.get("/available", teacher.getAvailableTeachers);

module.exports = router;
