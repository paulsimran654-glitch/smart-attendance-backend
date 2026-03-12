const Attendance = require("../models/Attendance");
const moment = require("moment-timezone");

const OFFICE_LAT = 26.1445;
const OFFICE_LNG = 91.7362;
const ALLOWED_RADIUS = 100;

function getDistance(lat1, lon1, lat2, lon2) {

const R = 6371e3;

const φ1 = lat1 * Math.PI/180;
const φ2 = lat2 * Math.PI/180;

const Δφ = (lat2-lat1) * Math.PI/180;
const Δλ = (lon2-lon1) * Math.PI/180;

const a =
Math.sin(Δφ/2) * Math.sin(Δφ/2) +
Math.cos(φ1) * Math.cos(φ2) *
Math.sin(Δλ/2) * Math.sin(Δλ/2);

const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

return R * c;
}

exports.scanQR = async (req, res) => {

try {

const { latitude, longitude, qr } = req.body;

let qrData;

try{
qrData = JSON.parse(qr);
}catch{
return res.status(400).json({message:"Invalid QR"});
}

if(qrData.type !== "attendance"){
return res.status(400).json({message:"Invalid QR"});
}

const user = req.user;

const distance = getDistance(
latitude,
longitude,
OFFICE_LAT,
OFFICE_LNG
);

if(distance > ALLOWED_RADIUS){
return res.status(400).json({message:"Not inside office location"});
}

const now = moment().tz("Asia/Kolkata");
const today = now.format("YYYY-MM-DD");
const time = now.format("HH:mm");

let attendance = await Attendance.findOne({
employee:user.id,
date:today
});

if(!attendance){

let status="present";

if(time > "09:15"){
status = "Late";
}

attendance = await Attendance.create({
employee:user.id,
employeeId:user.employeeId,
date:today,
checkIn:time,
status
});

return res.json({
message:"Attendance Recorded",
time,
status
});
}

if(!attendance.checkOut){

attendance.checkOut=time;

await attendance.save();

return res.json({
message:"Checkout Recorded",
time
});
}

return res.status(400).json({
message:"Attendance already completed"
});

}
catch(err){

res.status(500).json({message:err.message});
}

};