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
                day: Number,
                fromTime: String,
                toTime: String
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

TeacherAvailability.statics.getTeacherAvailability = function(teacherId) {
    return Promise.resolve()
    .then(()=>{
        try{
            return this.aggregate([
                {
                    $match: {
                        teacherId: mongoose.Types.ObjectId(teacherId)
                    }
                },
                // {
                //     $addFields: {
                //         weekdays: {
                //             $map: {
                //                 input: [0,1,2,3,4,5,6],
                //                 as: "day",
                //                 in: {
                //                     availability: {
                //                         $cond: [{$eq: [{$type: {$arrayElemAt: ["$weekdays", "$$day"]} }, "missing"]}, [], ]
                //                     }
                //                 }
                //             }
                //         }
                //     }
                // }
            ])
        }catch(err) {
            return Promise.reject({
                message: err.message
            })
        }
    })
    // return this.aggregate([
    //     {
    //         $match: {
    //             teacherId: mongoose.Types.ObjectId(teacherId)
    //         }
    //     },
    //     // {
    //     //     $addFields: {
    //     //         weekdays: {
    //     //             $map: {
    //     //                 input: [0,1,2,3,4,5,6],
    //     //                 as: "day",
    //     //                 in: {
    //     //                     availability: {
    //     //                         $cond: [{$eq: [{$type: {$arrayElemAt: ["$weekdays", "$$day"]} }, "missing"]}, [], ]
    //     //                     }
    //     //                 }
    //     //             }
    //     //         }
    //     //     }
    //     // }
    // ])
    .then(teacher=>{
        if(teacher) {
            return teacher;
        }else{
            return Promise.reject({
                status: 404,
                message: "Teacher not found"
            })
        }
    })
}

TeacherAvailability.statics.getAvailableTeachers = function (weekDay, timeFrom, timeTo) {
    // let weekDay = moment(date, 'YYYY-MM-DD').day();
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
            $match: {
                $expr: {
                    $and: [
                        {$gte: [timeFrom, "$availability.from"]},
                        {$lte: [timeFrom, "$availability.to"]},
                        {$gte: [timeTo, "$availability.from"]},
                        {$lte: [timeTo, "$availability.to"]},
                    ]
                }
            }
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
                                // cond: {$eq: [{$dateToString: {format: "%G-%m-%d", date: "$$time.fromTime"}}, date]}
                                cond: {
                                    $and: [
                                        {$eq: ["$$time.day", weekDay]},
                                        {
                                            $or: [
                                                {
                                                    $and: [
                                                        {$gt: [timeFrom, "$$time.fromTime"]},
                                                        {$lt: [timeFrom, "$$time.toTime"]},
                                                    ]
                                                },
                                                {
                                                    $and: [
                                                        {$gt: [timeTo, "$$time.fromTime"]},
                                                        {$lt: [timeTo, "$$time.toTime"]},
                                                    ]
                                                },
                                                {
                                                    $and: [
                                                        {$lt: [timeFrom, "$$time.fromTime"]},
                                                        {$gt: [timeTo, "$$time.toTime"]}
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                }   
                            }
                        },
                        as: "time",
                        in: {
                            fromTime: "$$time.fromTime",
                            toTime: "$$time.toTime",
                            // fromTime: {$dateToString: {format: "%H:%M", date: "$$time.fromTime"}},
                            // toTime: {$dateToString: {format: "%H:%M", date: "$$time.toTime"}}
                        }
                    }
                    
                }
            }
        },
        {
            $match: {
                $expr: {
                    $or: [
                        {
                            $eq: [{$size: "$unavailableTime"}, 0]
                        },
                        // {$lte: [timeTo, "$unavailableTime.0.fromTime"]},
                        // {$gte: [timeFrom, "$unavailableTime.0.toTime"]}
                        // {
                        //     $or: [
                        //         // {$gte: [timeFrom, "$unavailableTime.fromTime"]},
                        //         {$lte: [timeTo, "$unavailableTime.0.fromTime"]},
                        //         {$gte: [timeFrom, "$unavailableTime.0.toTime"]},
                        //         // {$lte: [timeTo, "$unavailableTime.toTime"]},
                        //     ]
                        // }
                    ]
                    
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

TeacherAvailability.statics.setUnavailableTime = function(teacherId, day, fromTime, toTime) {
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
            teacher.unavailableTime = [{day, fromTime, toTime}];
            return teacher.save();
        }else{
            return new this({
                teacherId,
                unavailableTime: {
                    day, fromTime, toTime
                }
            }).save();
        }
    })
}

module.exports = {
    Teacher,
    TeacherAvailability: mongoose.model('TeacherAvailability', TeacherAvailability)
}
