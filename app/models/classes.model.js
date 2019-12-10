const mongoose = require('mongoose');
const moment = require('moment');

const ClassSchema = mongoose.Schema({
    title: String,
    startDate: String,
    endDate: String,
    weekdays: {
        type: [

        ],
        default: []

    }
});

ClassSchema.methods.setDefaultWeekSchedule = function () {
    if (this.weekdays.length <= 0) {
        let weekdays = [];
        for (let i = 0; i < 7; i++) {
            weekdays.push({
                schedule: []
            });
        }
        this.weekdays = weekdays;
    }

}
ClassSchema.pre('save', function(next){
    if(this.weekdays.length <= 0) {
        this.setDefaultWeekSchedule();
    }
    next();
})
ClassSchema.methods.addScheduleItem = function (day, teacherId, timeFrom, timeTo) {
    console.log(day, teacherId, timeFrom, timeTo);


    let reso = this.weekdays[day].schedule.reduce((t, c) => {
        return t || ((c.timeFrom < timeFrom && c.timeTo > timeFrom) || (c.timeFrom < timeTo && c.timeTo > timeTo));
    }, false)

    if (!reso) {
        this.weekdays[day].schedule.push({
            teacherId, timeFrom, timeTo
        });
        console.log(this.weekdays[day]);
    }else{
        throw new Error("Time booked");
    }
    return this;
}


module.exports = function () {
    return {
        Class: mongoose.model('Class', ClassSchema)
    };
}