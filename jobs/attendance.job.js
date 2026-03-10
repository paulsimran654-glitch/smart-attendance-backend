const cron = require("node-cron");
const Attendance = require("../models/Attendance");
const User = require("../models/User");
const moment = require("moment-timezone");

const markAbsent = async () => {

const today = moment().tz("Asia/Kolkata").format("YYYY-MM-DD");

const employees = await User.find({role:"employee"});

for(const emp of employees){

const exists = await Attendance.findOne({
employee:emp._id,
date:today
});

if(!exists){

await Attendance.create({

employee:emp._id,
employeeId:emp.employeeId,
date:today,
status:"absent"
});

}

}

console.log("Absent marked for missing employees");

};

cron.schedule("31 9 * * *", markAbsent);