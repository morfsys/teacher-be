const Teacher = require("../models/teacher.model");
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
        delete: (req, res) => {
            let { mobile } = req.params;
            Teacher.find({ mobile }).remove().then(data => {
                res.status(200).send(data);
            }).catch(err => {
                res.status(500).send({
                    error: err.message || "Unknown error"
                });
            })
        }
    };

    return fn;
};
