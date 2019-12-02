const mongoose = require("mongoose");
const moment = require('moment');
const defaultWeekStructure = [
    {
        name: "sunday",
        availability: []
    },
    {
        name: "monday",
        availability: []
    },
    {
        name: "tuesday",
        availability: []
    },
    {
        name: "wednesday",
        availability: []
    },
    {
        name: "thursday",
        availability: []
    },
    {
        name: "friday",
        availability: []
    },
    {
        name: "saturday",
        availability: []
    },
]

const TeacherSchema = mongoose.Schema(
    {
        mobile: {
            type: String,
            default: ""
        },
        name: {
            type: String, default: "Teacher"
        }
    },
    {
        timestamps: true
    }
);
const DayTimeSchema = mongoose.Schema({
    from: {
        type: String,
        default: "10:00"
    },
    to: {
        type: String,
        default: "17:00"
    }
})
const AvailabiltySchema = mongoose.Schema({
    name: String,
    availability: [DayTimeSchema]

})

const TeacherAvailability = mongoose.Schema({
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teacher"
    },
    weekdays: {
        type: [AvailabiltySchema],
        default: defaultWeekStructure
    },
    unavailableTime: {
        type: [
            {
                fromTime: Date,
                toTime: Date
            }
        ],
        default: []
    }
});

const Teacher = mongoose.model('Teacher', TeacherSchema);

TeacherAvailability.statics.setAvailability = function(teacherId, weekdays) {
    return Teacher.findById(teacherId)
    .then(teacher=>{
        if(teacher) {
            return this.findOne({teacherId})
        }else{
            return Promise.reject({
                message: "Teacher not found",
                status: 404
            })
        }
    })
    .then(teacher=>{
        if(teacher) {
            teacher.weekdays = weekdays.map(e=>{
                if(e.availability[0].from == '') {
                    e.availability = [];
                }
                return e;
            });
            return teacher.save();
        }else{
            return new this({
                teacherId,
                weekdays
            }).save();
        }
    })
}

TeacherAvailability.statics.getAvailableTeachers = function (date, timeFrom, timeTo) {
    let weekDay = moment(date, 'YYYY-MM-DD').day();
    console.log(weekDay);
    return this.aggregate([
        {
            $addFields: {
                currentDaySchedule: {
                    $cond: [{ $eq: [{ $type: { $arrayElemAt: ["$weekdays", weekDay] } }, "missing"] }, [], { $arrayElemAt: ["$weekdays", weekDay] }]

                }
            }
        },
        {
            $project: {weekdays: 0}
        },  
        {
            $unwind: "$currentDaySchedule"
        },
        {
            $addFields: {
                availability: "$currentDaySchedule.availability"
            }
        },
        {
            $unwind: "$availability"
        },
        {
            $project: {currentDaySchedule: 0}
        },
        {
            $addFields:{
                // dateTime: {$dateToString: {format: "%G-%m-%d", date: "$fromTime"}},
                unavailableTime: {
                    $map: {
                        input: {
                            $filter: {
                                input: "$unavailableTime",
                                as: "time",
                                cond: {$eq: [{$dateToString: {format: "%G-%m-%d", date: "$$time.fromTime"}}, date]}
                            }
                        },
                        as: "time",
                        in: {
                            fromTime: {$dateToString: {format: "%H:%M", date: "$$time.fromTime"}},
                            toTime: {$dateToString: {format: "%H:%M", date: "$$time.toTime"}}
                        }
                    }
                    
                }
            }
        },
        {
            $lookup: {
                from: mongoose.model('Teacher').collection.collectionName,
                localField: "teacherId",
                foreignField: "_id",
                as: "teacher"
            }
        },
        {
            $unwind: "$teacher"
        },
        {
            $project: {teacherId:0}
        }
    ])
}

TeacherAvailability.statics.setUnavailableTime = function(teacherId, fromTime, toTime) {
    return Teacher.findById(teacherId)
    .then(teacher=>{
        if(teacher) {
            return this.findOne({teacherId})
        }else{
            return Promise.reject({
                message: "Teacher not found",
                status: 404
            })
        }
    })
    .then(teacher=>{
        if(teacher) {
            teacher.unavailableTime.push({fromTime, toTime});
            return teacher.save();
        }else{
            return new this({
                teacherId,
                unavailableTime: {
                    fromTime, toTime
                }
            }).save();
        }
    })
}

module.exports = {
    Teacher,
    TeacherAvailability: mongoose.model('TeacherAvailability', TeacherAvailability)
}
