const Discord = require('discord.js');
const client = new Discord.Client();
const sqlite = require('sqlite3').verbose();
const { token } = require(`./config.json`);
const { ppid } = require('process');

client.on(`ready`, () => {
    console.log("Online");
    let db = new sqlite.Database('./testdb.db', sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE);
    db.run(`CREATE TABLE IF NOT EXISTS data(userid INTEGER NOT NULL, username TEXT NOT NULL, word TEXT NOT NULL, score INTEGER NOT NULL, score2 INTEGER NOT NULL)`);
});

client.on(`message`, (message) => {
    let msg = message.content.toLowerCase();
    let userid = message.author.id;
    let uname = message.author.tag;
    if (message.author.bot) return;
    let db = new sqlite.Database('./testdb.db', sqlite.OPEN_READWRITE);

    if (msg == ".getdata") {
        message.delete();
        let query = `SELECT * FROM data WHERE userid = ?`;
        db.get(query, [userid], (err, row) => {
            if (err) {
                console.log(err);
                return;
            }
            if (row === undefined) {
                let insertdata = db.prepare(`INSERT INTO data VALUES(?,?,?,?,?)`);
                insertdata.run(userid, uname, "none", "0", "0");
                insertdata.finalize();
                db.close();
                return;
            } else {
                let userid2 = row.userid;
                let word = row.word;
                console.log(word)
            }
        });
    }

    if (msg.startsWith(".change")) {
        message.delete();
        let word = msg.slice(8);
        db.run(`UPDATE data SET word = ? WHERE userid = ?`, [word, userid]);
        console.log("done");
    }

    if (msg == ".lb") { //multi leaderboard command
        message.delete();

        let names = new Array(); //name array for score and overall
        let names2 = new Array(); //name array for score2
        let scores1 = new Array(); //score array for score
        let scores2 = new Array(); //score array for score2
        let scoresOverall = new Array(); //score array for overall
        let points;
        let lastPoint;

        let query = `SELECT score, username FROM data ORDER BY score DESC`;
        db.all(query, [], (err, row) => {
            if (err) {
                console.log(err);
                return;
            }

            points = row.length; //1st place person gets as many points as people
            lastPoint = row[0].score; //set the last point as the top person

            for (let i = 0; i < row.length; i++) {

                if ((points > 0) && (row[i].score < lastPoint)) { //make the next person get one less point if their score is less
                    points--;
                    lastPoint = row[i].score;
                }

                names.push(row[i].username);
                scores1.push(points);
                scoresOverall.push(points);

                if (i == (row.length - 1)) { //if we can move on to the next thing

                    let query2 = `SELECT score2, username FROM data ORDER BY score2 DESC`;
                    db.all(query2, [], (err, row2) => {
                        if (err) {
                            console.log(err);
                            return;
                        }

                        points = row2.length; //1st place person gets as many points as people
                        lastPoint = row2[0].score2; //set the last point as the top person

                        for (let i2 = 0; i2 < row2.length; i2++) {

                            if ((points > 0) && (row2[i2].score2 < lastPoint)) { //make the next person get one less point if their score is less
                                points--;
                                lastPoint = row2[i2].score2;
                            }

                            let index = names.indexOf(row2[i2].username); //where this person's score is in the array
                            scoresOverall[index] += points; //add the new points
                            names2.push(row2[i2].username);
                            scores2.push(points);

                        }

                        let msgtoSend = "```Score Leaderboard:\n\nPlace     Name                     Points";
                        let msgtoSend2 = "```Score2 Leaderboard:\n\nPlace     Name                     Points";
                        let place = 1;
                        for (let n = 0; n < names.length; n++) {
                            let space = (new Array(26 - (names[n].length)).join(" ")); //how many spaces to add after the name
                            let space2 = (new Array(26 - (names2[n].length)).join(" ")); //how many spaces to add after the name
                            let spacePlace = (new Array(11 - (place.toString().length)).join(" ")); //how many spaces to add after the name

                            msgtoSend += `\n${place}${spacePlace}${names[n]}${space}${scores1[n]}`
                            msgtoSend2 += `\n${place}${spacePlace}${names2[n]}${space2}${scores2[n]}`
                            place++;
                        }
                        message.channel.send(msgtoSend + "```").then(() => { message.channel.send(msgtoSend2 + "```") }).then(() => { overall(message, names, scoresOverall) });
                    });
                }
            }
        });
    }

    if (msg.startsWith(".lbone")) { //single leaderboard command
        message.delete();

        let names = new Array(); //name array for score and overall
        let scores = new Array(); //score array for score
        let points;
        let lastPoint;
        let msgtoSend = "```Score Leaderboard:\n\nPlace     Name                     Points";

        let query = `SELECT score, username FROM data ORDER BY score DESC`;
        db.all(query, [], (err, row) => {
            if (err) {
                console.log(err);
                return;
            }

            points = row.length; //1st place person gets as many points as people
            lastPoint = row[0].score; //set the last point as the top person

            for (let i = 0; i < row.length; i++) {

                if ((points > 0) && (row[i].score < lastPoint)) { //make the next person get one less point if their score is less
                    points--;
                    lastPoint = row[i].score;
                }

                names.push(row[i].username);
                scores.push(points);

                if (i == (row.length - 1)) { //if we can create the leaderboard to send

                    let place = 1;
                    for (let n = 0; n < names.length; n++) {
                        let space = (new Array(26 - (names[n].length)).join(" ")); //how many spaces to add after the name
                        let spacePlace = (new Array(11 - (place.toString().length)).join(" ")); //how many spaces to add after the name

                        msgtoSend += `\n${place}${spacePlace}${names[n]}${space}${scores[n]}`
                        place++;
                    }
                }
            }
            message.channel.send(msgtoSend + "```");
        });
    }

});

function overall(message, names, scores) { //create and send the overall leaderboard
    let origScores = scores.slice();
    let finalScores = scores.sort(function (a, b) { return b - a; });
    let origNames = names.slice();
    let i = 0;
    let nm = 0;
    do {
        nm = origScores.indexOf(finalScores[i]);
        names[i] = origNames[nm];
        i++;
    } while (i < finalScores.length);

    let msgtoSendOverall = "```Overall Leaderboard:\n\nPlace     Name                     Points";
    let place = 1;
    for (let n = 0; n < names.length; n++) {
        let space = (new Array(26 - (names[n].length)).join(" ")); //how many spaces to add after the name
        let spacePlace = (new Array(11 - (place.toString().length)).join(" ")); //how many spaces to add after the name
        msgtoSendOverall += `\n${place}${spacePlace}${names[n]}${space}${scores[n]}`
        place++;
    }
    message.channel.send(msgtoSendOverall + "```");
}

client.login(token);
