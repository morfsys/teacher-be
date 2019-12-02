const router = require("express").Router();
const teacher = require("../controllers/teacher.controller")();

router.post("/", teacher.register);
router.get("/", teacher.getAllTeachers);
router.delete("/:mobile", teacher.delete);
router.get("/:id/availabilty", teacher.getTeacherAvailability);
router.post("/:id/availabilty", teacher.setWeekDays);
router.put("/:id/unavailabilty", teacher.setUnavailableTime);
router.get("/available", teacher.getAvailableTeachers);

module.exports = router;
