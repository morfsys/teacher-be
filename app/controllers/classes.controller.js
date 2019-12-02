
module.exports = function() {
    const {Class} = require('./../models/classes.model')();
    let fn = {
        create: (req, res) => {
            const { title, startDate, endDate } = req.body;
            Promise.resolve()
            .then(()=>{
                if( !(title && startDate && endDate) ) {
                    return Promise.reject({
                        status: 400,
                        message: "title, startDate and endDate is required"
                    });
                }
                let cl = new Class({
                    title, startDate, endDate
                });
                cl.setDefaultWeekSchedule();
                return cl.save();
            })
            .then(data=>res.send({success: true}))
            .catch(err => {
                res.status(err.status || 500).send({
                    error: err.message || "Unknown error"
                });
            });
        },
        get: (req, res) => {
            Class.find({})
            .then(cls=>{
                res.send(cls)
            })
            .catch(err => {
                res.status(err.status || 500).send({
                    error: err.message || "Unknown error"
                });
            })
        },
        addItem: (req, res) => {
            const {day, teacherId, timeFrom, timeTo} = req.body;
            Class.findById(req.params.id)
            .then(item=>{
                if(item) {
                    return item.addScheduleItem(day, teacherId, timeFrom, timeTo);
                }else{
                    return Promise.reject({
                        status: 404,
                        message: "Class not found"
                    });
                }
            })
            .then(item=>res.send(item))
            .catch(err => {
                res.status(err.status || 500).send({
                    error: err.message || "Unknown error"
                });
            })
        }
    };

    return fn;
}