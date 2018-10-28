const D = require("discord.js");
const fs = require('fs');
var GoogleSpreadsheet = require('google-spreadsheet');
var creds = require('./client_secret.json');
var test = new D.Client();
var targetList;
var targetCount = 22;
var channelId = 0;

var sheetId = process.env.SHEET_ID;Dg1NDc2MjU1NzU2NzE0MDA1.DmxUtw.dT4-QTA_jdPP7LOWD6bmiWMQf50

var doc = new GoogleSpreadsheet(sheetId);

var command = "!";

// Configuration
var isTest = false;
var version = "v20180705-1";
var comment = "멍카운트 추가";

init();

setInterval(alarmFunc, 600000);

test.on('ready', () => {
    var message = "I am ready! <version> = " + version;
    message = message + "\nChanges : " + comment;

    sendMessage(message);
    if (isTest == false) {
        load();
    }
});

test.on("message", (message) => {
    if (message.content[0] != command) {
        return;
    }
    if (message.channel.id != channelId) {
        return;
    }
    var processed = false;
    if (message.content.indexOf("입력") != -1) {
        message.reply(doProcessInput(message.content));
        processed = true;
    } else if (message.content.indexOf("컷") != -1) {
        if (doCut(message.content) == true) {
            message.reply(message.content + " 확인");
            processed = true;
        }
    } else if (message.content.indexOf("리셋") != -1) {
        if (doReset(message.content) == true) {
            message.reply(getTargets());
            processed = true;
        }
    } else if (message.content.indexOf("예상") != -1) {
        if (doExpect(message.content) == true) {
            message.reply(message.content + " 확인");
            processed = true;
        }
    } else if (message.content.indexOf("멍") != -1) {
        if (doSkip(message.content) == true) {
            message.reply(message.content + " 확인");
            processed = true;
        }
    } else if (message.content.indexOf("추가") != -1) {
        if (doAdd(message.content) == true) {
            message.reply(message.content + " 확인");
            processed = true;
        }
    } else if (message.content.indexOf("삭제") != -1) {
        if (doRemove(message.content) == true) {
            message.reply(message.content + " 확인");
            processed = true;
        }
    } else if (message.content.trim().length == 1) {
        message.reply(getTargets());
        processed = true;
    } else {
        if (doCut(message.content) == true) {
            message.reply(message.content + " 확인");
            processed = true;
        }
    }
    if (!processed) {
        message.reply(getUsage(message.content));
    } else if (isTest == false) {
        save();
    }
});

function load()
{
    doc.useServiceAccountAuth(creds, function (err) {
        doc.getCells(1, function (err, cells) {
            if (!cells[0]) {
                sendMessage("로드 실패");
                init();
            } else {
                targetList = JSON.parse(cells[0].value);
                if (!targetList.length) {
                    sendMessage("로드 실패");
                    init();
                } else {
                    for (var i = 0; i < targetList.length; i++) {
                        targetList[i].cut = new Date(targetList[i].cut);
                        targetList[i].gen = new Date(targetList[i].gen);
                        targetList[i].time = new Date(targetList[i].time);
                        targetList[i].mCount = (!targetList[i].mCount ? 0 : targetList[i].mCount * 1);
                    }
                    sendMessage("로드 완료");
                }
            }
            sendMessage(getTargets());
        });
    });
    // Use local file
    /*
    if (fs.existsSync('target-list.json')) {
        var data = fs.readFileSync('target-list.json');  
        targetList = JSON.parse(data);
    }
    for (var i = 0; i < targetList.length; i++) {
        targetList[i].cut = new Date(targetList[i].cut);
        targetList[i].gen = new Date(targetList[i].gen);
    }
    */
}

function save()
{
    doc.useServiceAccountAuth(creds, function (err) {
        doc.getCells(1, function (err, cells) {
            cells[0].value = JSON.stringify(targetList);
            cells[0].save(function (err) {
            });
        });
    });
    // Use local file
    /* 
    var data = JSON.stringify(targetList);
    fs.writeFileSync('target-list.json', data); 
    */
}

function alarmFunc()
{
    var now = genDate();
    var message = "";
    for (var i = 0; i < targetList.length; i++) {
        var diff = targetList[i].gen - now;
        if ( 0 < diff && diff < 900000 ) {
            message = message + "\n" + targetList[i].id + " " + getTime(targetList[i].gen) + " 예정";
        }
    }
    if (message.length > 0) {
        sendMessage(message);
    }
}

function sendMessage(message)
{
    test.channels.get(channelId).send(message);
}

function getUsage(text)
{
    var str = "";
    if (text) {
        str = str + text + " ??";
    }
    str = str + "\n";
    str = str + "<목록> : \"!\"\n<리셋시간 입력> : \"!리셋 0524\"\n<컷시간 입력> : \"!1924 기감\"\n<예상 컷시간 입력> : \"!1924 기감 예상\"\n<멍처리> : \"!기감멍\"\n";
    str = str + "<보스 목록 추가> : \"!추가 산적 0300\"\n<보스 목록 삭제> : \"!삭제 산적\"\n";
    str = str + "1시간 이전 내용은 누락 표시.  문의 : 보금자리\n( version : " + version + " )";
    return str;
}

function init() {
    targetList = [];
    targetList.push(new Target("감시자", 6));
    targetList.push(new Target("거드", 3));
    targetList.push(new Target("기감", 1));
    targetList.push(new Target("녹샤", 2));
    targetList.push(new Target("대흑장", 3));
    targetList.push(new Target("데스", 7));
    targetList.push(new Target("동드", 3));
    targetList.push(new Target("마요", 3));
    targetList.push(new Target("빨샤", 2));
    targetList.push(new Target("산적", 3));
    targetList.push(new Target("서드1", 2));
    targetList.push(new Target("서드2", 2));
    targetList.push(new Target("스피", 3));
    targetList.push(new Target("아르", 4));
    targetList.push(new Target("에자", 5));
    targetList.push(new Target("웜", 2));
    targetList.push(new Target("이프", 2));
    targetList.push(new Target("자크", 3));
    targetList.push(new Target("중드", 3));
    targetList.push(new Target("카파", 2));
    targetList.push(new Target("커츠", 5));
    targetList.push(new Target("피닉", 7));

    if (isTest == true) {
        test.login(process.env.TEST_DISCORD_TOKEN);
        channelId = process.env.TEST_DISCORD_CHANNEL;
    } else {
        test.login(process.env.DISCORD_TOKEN); // 보탐봇
        channelId = process.env.DISCORD_CHANNEL; // 연합, 보스시간
    }
}

function genDate(date)
{
    var now;
    if (date) {
        now = date
    } else {
        now = new Date();
    }
   
    return new Date(now - ((now.getTimezoneOffset() - 540) * 60 * 1000));
}
function calcTime(a, b)
{
    a.setHours(a.getHours() + b.getHours(), a.getMinutes() + b.getMinutes());
    return a;
}

function Target(id, time) {
    var date = genDate();
    date.setHours(0, 0, 0, 0);
    this.id = id;
    this.cut = date;
    this.expect = false;
    this.mCount = 0;

    var tempTime = time + "";
    if (tempTime.indexOf(":") == -1) {
        var newTime = "";
        for (var i = 0; i < tempTime.length; i++) {
            if (i == tempTime.length -2) {
                newTime = newTime + ":";
            }
            newTime = newTime + tempTime[i];
        }
        tempTime = newTime;
    }
    var splitted = tempTime.split(":");
    var regenDate = genDate();
    regenDate.setHours(splitted[0] ? splitted[0] : 0, splitted[1] ? splitted[1] : 0, 0, 0)
    this.time = regenDate;
    this.gen = calcTime(date, regenDate);
}

function setCut(id, time, expect) {
    for (var i = 0; i < targetList.length; i++) {
        if (id == targetList[i].id) {
            var date = genDate();
            var splitted = time.split(":");
            if (!checkNum(splitted[0], 0, 23) || !checkNum(splitted[1], 0, 59)) {
                return false;
            }
            date.setHours(splitted[0], splitted[1], 0, 0);
            targetList[i].cut = date;
            targetList[i].gen = calcTime(date, targetList[i].time);
            targetList[i].expect = expect;
            targetList[i].mCount = 0;
            return true;
        }
    }
    return false;
}

function checkNum(target, min, max) {
    if (isNaN(target)) {
        return false;
    }
    if (target < min) {
        return false;
    }
    if (target > max) {
        return false;
    }
    return true;
}

function getTime(time) {
    var hours = time.getHours();
    var minutes = time.getMinutes();
    if (hours < 10) hours = '0' + hours;
    if (minutes < 10) minutes = '0' + minutes;
    return hours + ":" + minutes;
}

function reset(time) {
    var gen = genDate();
    var splitted = time.split(":");
    if (!checkNum(splitted[0], 0, 23) || !checkNum(splitted[1], 0, 59)) {
        return false;
    }
    gen.setHours(splitted[0], splitted[1], 0, 0);
    for (var i = 0; i < targetList.length; i++) {
        targetList[i].gen = gen;
        targetList[i].expect = false;
        targetList[i].mCount = 0;
    }
    return true;
}

function getUncheckedTime(id, gen, now, time)
{
    var text = " 누락 ";
    var count = 0;
    var temp = new Date(gen);
    while (temp < now) {
        temp = calcTime(temp, time);
        count = count + 1;
    }
    if (id != "에자" && id != "커츠" && id != "피닉" && id != "데스") {
        temp.setMinutes(temp.getMinutes() + (2 * count));
    }
    text = text + count + "회   " + getTime(temp) + " 예상";
    return text;
}

function getTargets()
{
    sortTargets();
    var now = genDate();
    now.setHours(now.getHours() - 1);
    var targets = "\n";
    for (var i = 0; i < targetList.length; i++) {
        var checked = !(targetList[i].gen < now);
        targets = targets + targetList[i].id + " " + getTime(targetList[i].gen) + 
        (checked ? "" : getUncheckedTime(targetList[i].id, targetList[i].gen, now, targetList[i].time)) +
        ((checked == true && targetList[i].expect == true) ? " 예상" : "") +
        ((!targetList[i].mCount) ? "" : (" " + targetList[i].mCount + "멍")) +
        "\n";
    }
    //var now = genDate();
    //targets = targets + getTime(now);
    return targets;
}

function sortTargets()
{
    targetList.sort(function(a, b) {
        var now = genDate();
        now.setHours(now.getHours() - 1);
        if (a.gen >= now && b.gen >= now) {
            return (a.gen > b.gen) ? 1 : -1;
        }
        if (a.gen >= now && b.gen < now) {
            return 1;
        }
        if (a.gen < now && b.gen >= now) {
            return -1;
        }
        var count = 0;
        var expectA = new Date(a.gen);
        while (expectA < now) {
            expectA = calcTime(expectA, a.time);
            count = count + 1;
        }
        expectA.setMinutes(expectA.getMinutes() + (2 * count));

        count = 0;
        var expectB = new Date(b.gen);
        while (expectB < now) {
            expectB = calcTime(expectB, b.time);
            count = count + 1;
        }
        expectB.setMinutes(expectB.getMinutes() + (2 * count));

        return (expectA > expectB) ? 1 : -1;
    });
}

function dateString(date)
{
    return date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes();
}

function doAdd(str)
{
    var splitted = refineStr(str);
    if (splitted.length != 2) {
        return false;
    }
    var id = splitted[1];
    var time = splitted[0];
    var isExist = false;
    for (var i = 0; i < targetList.length; i++) {
        if (id == targetList[i].id) {
            isExist = true;
            break;
        }
    }
    if (isExist == true) {
        return false;
    }
    targetList.push(new Target(id, time*1));
    return true;
}

function doRemove(str)
{
    var splitted = refineStr(str);
    if (splitted.length != 1) {
        return false;
    }
    var id = splitted[0];
    var isExist = false;
    for (var i = 0; i < targetList.length; i++) {
        if (id == targetList[i].id) {
            isExist = true;
            targetList.splice(i, 1);
            break;
        }
    }
    if (isExist == false) {
        return false;
    }
    return true;
}

function doSkip(str)
{
    var splitted = refineStr(str);
    if (splitted.length != 1) {
        return false;
    }
    var id = splitted[0];
    for (var i = 0; i < targetList.length; i++) {
        if (id == targetList[i].id) {
            targetList[i].cut = targetList[i].gen;
            var newDate = new Date(targetList[i].cut);
            targetList[i].gen = calcTime(newDate, targetList[i].time);
            targetList[i].expect = false;
            targetList[i].mCount++;
            return true;
        }
    }
}

function doReset(str)
{
    var splitted = refineStr(str);
    if (splitted.length != 1) {
        return;
    }
    var time = splitted[0];
    if (time.indexOf(":") == -1) {
        var newTime = "";
        for (var i = 0; i < time.length; i++) {
            if (i == time.length -2) {
                newTime = newTime + ":";
            }
            newTime = newTime + time[i];
        }
        time = newTime;
    }
    return reset(time);
}

function doExpect(str)
{
    var splitted = refineStr(str);
    if (splitted.length != 2) {
        return;
    }
    var time = splitted[0];
    var id = splitted[1];
    if (time.indexOf(":") == -1) {
        var newTime = "";
        for (var i = 0; i < time.length; i++) {
            if (i == time.length -2) {
                newTime = newTime + ":";
            }
            newTime = newTime + time[i];
        }
        time = newTime;
    }

    return setCut(id, time, true);
}

function doCut(str)
{
    var splitted = refineStr(str);
    if (splitted.length != 2) {
        return;
    }
    var time = splitted[0];
    var id = splitted[1];
    if (time.indexOf(":") == -1) {
        var newTime = "";
        for (var i = 0; i < time.length; i++) {
            if (i == time.length -2) {
                newTime = newTime + ":";
            }
            newTime = newTime + time[i];
        }
        time = newTime;
    }

    return setCut(id, time, false);
}

function doSet(str)
{
    var expected = (str.indexOf("예상") != -1);
    var splitted = refineStr(str);
    if (splitted.length != 2) {
        return false;
    }
    var time = splitted[0];
    var id = splitted[1];
    if (time.indexOf(":") == -1) {
        var newTime = "";
        for (var i = 0; i < time.length; i++) {
            if (i == time.length -2) {
                newTime = newTime + ":";
            }
            newTime = newTime + time[i];
        }
        time = newTime;
    }
    for (var i = 0; i < targetList.length; i++) {
        if (id == targetList[i].id) {
            var date = genDate();
            var splitted = time.split(":");
            if (!checkNum(splitted[0], 0, 23) || !checkNum(splitted[1], 0, 59)) {
                return false;
            }
            date.setHours(splitted[0], splitted[1], 0, 0);
            targetList[i].gen = date;
            targetList[i].expect = expected;
            targetList[i].mCount = 0;
            return true;
        }
    }
    return false;
}

function doProcessInput(str)
{
    var retMessage = "";
    var splitted = str.split("\n");
    splitted = splitted.filter((val) => val.trim() != "");
    for (var i = 1; i < splitted.length; i++) {
        var content = splitted[i];
        if (doSet(content)) {
            retMessage = retMessage + content + " 확인\n";
        } else {
            retMessage = retMessage + content + " 실패\n";
        }
    }
    return retMessage;
}

function refineStr(str)
{
    str = str.replace(command, "");
    str = str.replace("컷", "");
    str = str.replace("리셋", "");
    str = str.replace("예상", "");
    str = str.replace("멍", "");
    str = str.replace("추가", "");
    str = str.replace("삭제", "");
    var splitted = str.split(" ");
    splitted = splitted.filter((val) => val.trim() != "");
    splitted.sort();
    return splitted;
}
