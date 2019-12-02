const mongoose = require('mongoose');
const moment = require('moment');

const ClassSchema = mongoose.Schema({
    title: String,
    startDate: Date,
    endDate: Date,
    weekdays: {
        default: []
    }
});

ClassSchema.methods.setDefaultWeekSchedule = function() {
    let weekdays = [];
    for(let i=0; i<7; i++) {
        weekdays.push({
            schedule: []
        });
    }
    this.weekdays = weekdays;
}
ClassSchema.pre('save', function(next){
    if(this.weekdays.length <= 0) {
        this.setDefaultWeekSchedule();
    }
    next();
})
ClassSchema.methods.addScheduleItem = function(day, teacherId, timeFrom, timeTo) {
    return Promise.resolve()
    .then(()=>{
        let occupied = this.weekdays[day].schedule.reduce((t,c)=>{
            return t || ((c.timeFrom < timeFrom && c.timeTo > timeFrom) || (c.timeFrom < timeTo && c.timeTo > timeTo) );
        }, false)
        return Promise.resolve(occupied);
    })
    .then(reso=>{
        if(!reso) {
            this.weekdays[day].schedule.push({
                teacherId, timeFrom, timeTo
            });
            return this.save();
        }else{
            return Promise.reject({
                status: 405,
                message: "Time already occupied"
            });
        }
    });
}


module.exports = function() {
    return {
        Class: mongoose.model('Class', ClassSchema)
    };
}