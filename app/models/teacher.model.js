const mongoose = require("mongoose");

const TeacherSchema = mongoose.Schema(
    {
        mobile: {
            type: String,
            default: ""
        },
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Teacher", TeacherSchema);
