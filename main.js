// Delivery Driver Shift Tracker Assignment
const fs = require("fs");

// ============================================================
// Function 1: getShiftDuration(startTime, endTime)
// startTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// endTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// Returns: string formatted as h:mm:ss
// ============================================================
function getShiftDuration(startTime, endTime) {

    let s = startTime.split(" ");
    let e = endTime.split(" ");

    let st = s[0].split(":");
    let et = e[0].split(":");

    let sh = parseInt(st[0]);
    let sm = parseInt(st[1]);
    let ss = parseInt(st[2]);

    let eh = parseInt(et[0]);
    let em = parseInt(et[1]);
    let es = parseInt(et[2]);

    if(s[1] === "pm" && sh != 12) sh += 12;
    if(s[1] === "am" && sh == 12) sh = 0;

    if(e[1] === "pm" && eh != 12) eh += 12;
    if(e[1] === "am" && eh == 12) eh = 0;

    let start = sh*3600 + sm*60 + ss;
    let end = eh*3600 + em*60 + es;

    let diff = end - start;

    let h = Math.floor(diff/3600);
    let m = Math.floor((diff%3600)/60);
    let sec = diff%60;

    if(m < 10) m = "0"+m;
    if(sec < 10) sec = "0"+sec;

    return h + ":" + m + ":" + sec;
}

// ============================================================
// Function 2: getIdleTime(startTime, endTime)
// startTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// endTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// Returns: string formatted as h:mm:ss
// ============================================================
function getIdleTime(startTime, endTime) {

    function toSec(t){

        let p = t.split(" ");
        let time = p[0].split(":");

        let h = parseInt(time[0]);
        let m = parseInt(time[1]);
        let s = parseInt(time[2]);

        if(p[1] === "pm" && h != 12) h += 12;
        if(p[1] === "am" && h == 12) h = 0;

        return h*3600 + m*60 + s;
    }

    let start = toSec(startTime);
    let end = toSec(endTime);

    let startLimit = 8*3600;
    let endLimit = 22*3600;

    let idle = 0;

    if(start < startLimit){
    idle += Math.min(end,startLimit) - start;
}

if(end > endLimit){
    idle += end - Math.max(start,endLimit);
}

    let h = Math.floor(idle/3600);
    let m = Math.floor((idle%3600)/60);
    let s = idle%60;

    if(m < 10) m = "0"+m;
    if(s < 10) s = "0"+s;

    return h + ":" + m + ":" + s;
}

// ============================================================
// Function 3: getActiveTime(shiftDuration, idleTime)
// shiftDuration: (typeof string) formatted as h:mm:ss
// idleTime: (typeof string) formatted as h:mm:ss
// Returns: string formatted as h:mm:ss
// ============================================================
function getActiveTime(shiftDuration, idleTime) {

    function toSec(t){
        let a = t.split(":");
        return parseInt(a[0])*3600 + parseInt(a[1])*60 + parseInt(a[2]);
    }

    let shift = toSec(shiftDuration);
    let idle = toSec(idleTime);

    let active = shift - idle;

    let h = Math.floor(active/3600);
    let m = Math.floor((active%3600)/60);
    let s = active%60;

    if(m < 10) m = "0"+m;
    if(s < 10) s = "0"+s;

    return h + ":" + m + ":" + s;
}

// ============================================================
// Function 4: metQuota(date, activeTime)
// date: (typeof string) formatted as yyyy-mm-dd
// activeTime: (typeof string) formatted as h:mm:ss
// Returns: boolean
// ============================================================
function metQuota(date, activeTime) {

    let d = date.split("-");
    let month = parseInt(d[1]);
  let day = parseInt(d[2]);

    function toSec(t){
        let a = t.split(":");
        return parseInt(a[0])*3600 + parseInt(a[1])*60 + parseInt(a[2]);
    }

    let active = toSec(activeTime);

    let quota;

    if(month === 4 && day >= 10 && day <= 30){
    quota = 6*3600;
} else {
        quota = 8*3600 + 24*60;
    }

    if(active >= quota){
        return true;
    } else {
        return false;
    }
}
// ============================================================
// Function 5: addShiftRecord(textFile, shiftObj)
// textFile: (typeof string) path to shifts text file
// shiftObj: (typeof object) has driverID, driverName, date, startTime, endTime
// Returns: object with 10 properties or empty object {}
// ============================================================
function addShiftRecord(textFile, shiftObj) {

    let data = fs.readFileSync(textFile,"utf8");
    let rows = data.split("\n");

    for(let i=0;i<rows.length;i++){

        let r = rows[i].split(",");

        if(r[0] === shiftObj.driverID && r[2] === shiftObj.date){
            return {};
        }

    }

    let shiftDuration = getShiftDuration(shiftObj.startTime,shiftObj.endTime);
    let idleTime = getIdleTime(shiftObj.startTime,shiftObj.endTime);
    let activeTime = getActiveTime(shiftDuration,idleTime);
    let quota = metQuota(shiftObj.date,activeTime);

    let newRow =
    shiftObj.driverID + "," +
    shiftObj.driverName + "," +
    shiftObj.date + "," +
    shiftObj.startTime + "," +
    shiftObj.endTime + "," +
    shiftDuration + "," +
    idleTime + "," +
    activeTime + "," +
    quota + "," +
    false;

   if(rows[rows.length-1] === ""){
    rows.pop();
}

rows.push(newRow);

    fs.writeFileSync(textFile, rows.join("\n"));

    return {
        driverID: shiftObj.driverID,
        driverName: shiftObj.driverName,
        date: shiftObj.date,
        startTime: shiftObj.startTime,
        endTime: shiftObj.endTime,
        shiftDuration: shiftDuration,
        idleTime: idleTime,
        activeTime: activeTime,
        metQuota: quota,
        hasBonus: false
    };

}

// ============================================================
// Function 6: setBonus(textFile, driverID, date, newValue)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// date: (typeof string) formatted as yyyy-mm-dd
// newValue: (typeof boolean)
// Returns: nothing (void)
// ============================================================
function setBonus(textFile, driverID, date, newValue) {

    let data = fs.readFileSync(textFile,"utf8");
    let rows = data.split("\n");

    for(let i=0;i<rows.length;i++){

        let r = rows[i].split(",");

        if(r[0] === driverID && r[2] === date){

           r[9] = newValue.toString();

            rows[i] = r.join(",");

        }

    }

    fs.writeFileSync(textFile, rows.join("\n"));
}

// ============================================================
// Function 7: countBonusPerMonth(textFile, driverID, month)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// month: (typeof string) formatted as mm or m
// Returns: number (-1 if driverID not found)
// ============================================================
function countBonusPerMonth(textFile, driverID, month) {

    let data = fs.readFileSync(textFile,"utf8");
    let rows = data.split("\n");

    let count = 0;
    let found = false;

    for(let i=0;i<rows.length;i++){

        let r = rows[i].split(",");

        if(r[0] === driverID){

            found = true;

            let m = r[2].split("-")[1];

            if(parseInt(m) === parseInt(month) && r[9] === "true"){
                count++;
            }

        }

    }

    if(found === false) return -1;

    return count;
}

// ============================================================
// Function 8: getTotalActiveHoursPerMonth(textFile, driverID, month)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// month: (typeof number)
// Returns: string formatted as hhh:mm:ss
// ============================================================
function getTotalActiveHoursPerMonth(textFile, driverID, month) {

    let data = fs.readFileSync(textFile,"utf8");
    let rows = data.split("\n");

    let total = 0;

    for(let i=0;i<rows.length;i++){

        let r = rows[i].split(",");

        if(r[0] === driverID){

            let m = r[2].split("-")[1];

            if(parseInt(m) === parseInt(month)){

                let t = r[7].split(":");

                total += parseInt(t[0])*3600 +
                         parseInt(t[1])*60 +
                         parseInt(t[2]);

            }

        }

    }

    let h = Math.floor(total/3600);
    let m = Math.floor((total%3600)/60);
    let s = total%60;

    if(m < 10) m = "0"+m;
    if(s < 10) s = "0"+s;

    return h + ":" + m + ":" + s;
}

// ============================================================
// Function 9: getRequiredHoursPerMonth(textFile, rateFile, bonusCount, driverID, month)
// textFile: (typeof string) path to shifts text file
// rateFile: (typeof string) path to driver rates text file
// bonusCount: (typeof number) total bonuses for given driver per month
// driverID: (typeof string)
// month: (typeof number)
// Returns: string formatted as hhh:mm:ss
// ============================================================
function getRequiredHoursPerMonth(textFile, rateFile, bonusCount, driverID, month) {

    let data = fs.readFileSync(textFile,"utf8");
    let rows = data.split("\n");

    let total = 0;

    for(let i=0;i<rows.length;i++){

        let r = rows[i].split(",");

        if(r[0] === driverID){

            let dateParts = r[2].split("-");
            let m = parseInt(dateParts[1]);
            let d = parseInt(dateParts[2]);

            if(m === parseInt(month)){

                if(d >= 10 && d <= 30){
                    total += 6*3600;
                }else{
                    total += 8*3600 + 24*60;
                }

            }

        }

    }

    total -= bonusCount * 2 * 3600;

    let h = Math.floor(total/3600);
    let m = Math.floor((total%3600)/60);
    let s = total%60;

    if(m < 10) m = "0"+m;
    if(s < 10) s = "0"+s;

    return h + ":" + m + ":" + s;
}

// ============================================================
// Function 10: getNetPay(driverID, actualHours, requiredHours, rateFile)
// driverID: (typeof string)
// actualHours: (typeof string) formatted as hhh:mm:ss
// requiredHours: (typeof string) formatted as hhh:mm:ss
// rateFile: (typeof string) path to driver rates text file
// Returns: integer (net pay)
// ============================================================
function getNetPay(driverID, actualHours, requiredHours, rateFile) {

    let data = fs.readFileSync(rateFile,"utf8");
    let rows = data.split("\n");

    let basePay = 0;
    let tier = 0;

    for(let i=0;i<rows.length;i++){

        let r = rows[i].split(",");

        if(r[0] === driverID){
            basePay = parseInt(r[2]);
            tier = parseInt(r[3]);
        }

    }

    function toSec(t){
        let a = t.split(":");
        return parseInt(a[0])*3600 +
               parseInt(a[1])*60 +
               parseInt(a[2]);
    }

    let actual = toSec(actualHours);
    let required = toSec(requiredHours);

    if(actual >= required){
        return basePay;
    }

    let missing = required - actual;

    let allow = 0;

    if(tier === 1) allow = 50;
    if(tier === 2) allow = 20;
    if(tier === 3) allow = 10;
    if(tier === 4) allow = 3;

    missing = missing/3600 - allow;

    if(missing < 0) missing = 0;

    missing = Math.floor(missing);

    let rate = Math.floor(basePay/185);

    let deduction = missing * rate;

    return basePay - deduction;
}

module.exports = {
    getShiftDuration,
    getIdleTime,
    getActiveTime,
    metQuota,
    addShiftRecord,
    setBonus,
    countBonusPerMonth,
    getTotalActiveHoursPerMonth,
    getRequiredHoursPerMonth,
    getNetPay
};
