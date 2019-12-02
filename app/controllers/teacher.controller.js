const {Teacher, TeacherAvailability} = require("../models/teacher.model");
const mongoose = require("mongoose");
module.exports = () => {
    const fn = {
        register: (req, res) => {
            const teacher = new Teacher(req.body);
            Teacher.findOne(
                {
                    mobile: teacher.mobile
                },
                (err, data) => {
                    if (!data) {
                        teacher.save()
                            .then(data => {
                                res.status(200).send(data);
                            })
                            .catch(err => {
                                res.status(500).send({
                                    error: err.message || "Unknown error"
                                });
                            });
                    } else {
                        res.status(400).send({
                            message: "Mobile already in use"
                        });
                    }
                });
        },
        getAllTeachers: (req, res) => {
            let query = {};

            if (req.query.q && req.query.q != "") {
                let patt = new RegExp("^" + req.query.q, "i");
                query = {
                    $or: [
                        {
                            firstName: patt
                        }
                    ]
                };
            }
            Teacher.find(query)
                .then(data => {
                    res.status(200).send(data);
                })
                .catch(err => {
                    res.status(500).send({
                        message: err.message || "Unknown error occured"
                    });
                });
        },
        getTeacherAvailability: (req, res) => {
            TeacherAvailability.getTeacherAvailability(req.params.id)
            .then(data => {
                res.status(200).send(data);
            })
            .catch(err => {
                res.status(500).send({
                    message: err.message || "Unknown error occured"
                });
            });
        },
        delete: (req, res) => {
            let { mobile } = req.params;
            Teacher.find({ mobile }).remove().then(data => {
                res.status(200).send(data);
            }).catch(err => {
                res.status(500).send({
                    error: err.message || "Unknown error"
                });
            })
        },
        setWeekDays: (req, res, next) => {
            const {weekdays} = req.body;
            Promise.resolve()
            .then(()=>{
                console.log(typeof weekdays, weekdays.length );
                if(!(typeof weekdays == 'object' && weekdays.length == 7)) {
                    return Promise.reject({
                        status: 400,
                        message: "Bad request"
                    });
                }
                return TeacherAvailability.setAvailability(req.params.id, weekdays)
            })
            
            .then(teacher=>{
                return Promise.resolve({success: true})
            })

            .then(data=>res.send(data))
            .catch(err => {
                res.status(err.status || 500).send({
                    error: err.message || "Unknown error"
                });
            })
        },
        setUnavailableTime: (req, res) => {
            const {day, fromTime, toTime} = req.body;
            Promise.resolve()
            .then(()=>{
               
                if(!(fromTime && toTime)) {
                    return Promise.reject({
                        status: 400,
                        message: "Bad request"
                    });
                }
                return TeacherAvailability.setUnavailableTime(req.params.id, day, fromTime, toTime);
            })
            .then(teacher=>{
                return Promise.resolve({success: true})
            })

            .then(data=>res.send(data))
            .catch(err => {
                res.status(err.status || 500).send({
                    error: err.message || "Unknown error"
                });
            })
        },
        getAvailableTeachers: (req, res) => {
            const {day, fromTime, toTime} = req.query;
            TeacherAvailability.getAvailableTeachers(parseInt(day), fromTime, toTime)
            
            
            .then(data=>res.send(data))
            .catch(err => {
                res.status(err.status || 500).send({
                    error: err.message || "Unknown error"
                });
            })
        }
    };

    return fn;
};
