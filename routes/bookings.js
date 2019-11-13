var express = require('express');
var router = express.Router();

var {mongoose} = require('../db/mongoose');
var {Bookings} = require('../model/bookings');
const {ObjectID} = require('mongodb').ObjectID;


/* making a new booking if selected slot is free */
router.post('/new/', function(req,res){

    let starttime = req.body.starttime;
    let endtime = req.body.endtime;
    let event = req.body.event;
    Bookings.find({
        event : event,
        status : 1,
        $or : [
            {$or : [{starttime : {$gte : starttime, $lte : endtime}, endtime: {$gte : starttime, $lte : endtime}}] },
            {$and : [{starttime : {$lte : starttime}},{endtime : {$gte : endtime}}]}
        ]}).then((booking)=>{
            if(booking.length===0)
            {
                let new_booking = new Bookings({
                    uid : req.body.uid,
                    starttime: req.body.starttime,
                    endtime: req.body.endtime,
                    event: req.body.event,
                    period: req.body.period,
                    status: req.body.status
                });
                new_booking.save().then(() => {
                    res.send("Booking successfully created")
                }, (e) => {
                    res.status(400).send(e);
                })
            }
            else
            {
                res.send("Booking failed. Slot you have selected is already booked");
            }
        }, (e) => {
            res.status(400).send(e);
        })
});

/* cancelling a booking */
router.delete('/cancel/', function(req,res) {
    let booking_id = req.body.booking_id;
    console.log(booking_id);
    // console.log(mongoose.Types.ObjectId(booking_id));
    booking_id = mongoose.Types.ObjectId(booking_id);
    console.log(typeof booking_id);

    // let booking =  Bookings.find({
    //     _id: booking_id});
    Bookings.find({
        _id: booking_id
    }).then((booking) => {
        // booking.status = 0;
        Bookings.update({
            _id: booking_id
        }, {
            $set: {
                status: 1
            }
        }).then(() => {
            res.send("Booking has been cancelled");
        }), (e2) => {
            res.status(400).send(e2);
        }
    },(e) => {
        res.status(400).send(e);
    });
    //     .then((booking) => {
    //     if(booking.length===0)
    //         res.send("Booking not found");
    //     booking.status = 0;
    //     booking.save().then(() => {
    //         res.send("Booking has been cancelled");
    //     })
    // }, (e) => {
    //     res.status(400).send(e);
    // ;
    // console.log(booking);
    // if(booking.length===0)
    //     res.send("Booking not found");

    // booking.status = 0;
    // booking.save().then(() => {
    //     res.send("Booking has been cancelled");
    // }, (e) => {
    //     res.status(400).send(e);
    // });
});

module.exports = router;