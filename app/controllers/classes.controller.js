const mongoose = require('mongoose');
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
                // cl.setDefaultWeekSchedule();
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
            let query = {};
           
            Promise.resolve()
            .then(()=>{
                try{
                    if(req.params.id) {
                        query = {...query, _id: mongoose.Types.ObjectId(req.params.id)}
                    }
                    return Class.aggregate([
                        {
                            $match: query
                        }
                    ])
                }catch(err) {
                    return Promise.reject({
                        message: err.message
                    })
                }
            })
            
            // .then(cls=>{
            //     return Promise.all(cls.map(e=>{
            //         return e.save();
            //     }))
            // })
            .then(cls=>{
                if(req.params.id) {
                    if(cls.length > 0) {
                        res.send(cls[0])
                    }else{
                        return Promise.reject({
                            status: 404, message: "Class not found"
                        })
                    }
                }else{
                    res.send(cls);
                }
            })
            .catch(err => {
                res.status(err.status || 500).send({
                    error: err.message || "Unknown error"
                });
            })
        },
        delete: (req, res) => {
            let {title} = req.params;
            Class.findOneAndDelete({title})

            .then(cls=>{
                res.send({success: true})
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
                    let newItem = item.addScheduleItem(day, teacherId, timeFrom, timeTo);
                    return Class.findByIdAndUpdate(req.params.id, {weekdays: newItem.weekdays}, {new: true})
                }else{
                    return Promise.reject({
                        status: 404,
                        message: "Class not found"
                    });
                }
            })
            .then(item=>{
                console.log('item:'+item)
                res.send(item);
            })
            .catch(err => {
                res.status(err.status || 500).send({
                    error: err.message || "Unknown error"
                });
            })
        }
    };

    return fn;
}