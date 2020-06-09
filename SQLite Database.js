const Discord = require('discord.js');
const client = new Discord.Client();
const sqlite = require('sqlite3').verbose();

client.on(`ready`, () => {
    console.log("Online");
    let db = new sqlite.Database('./testdb.db', sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE);
    db.run(`CREATE TABLE IF NOT EXISTS data(userid INTEGER NOT NULL, username TEXT NOT NULL, word TEXT NOT NULL)`);
});

client.on(`message`, (message) => {
    let msg = message.content.toLowerCase();
    let userid = message.author.id;
    let uname = message.author.tag;
    if (message.author.bot) return;
    let db = new sqlite.Database('./testdb.db', sqlite.OPEN_READWRITE);

    if (msg == ".getdata") {
        let query = `SELECT * FROM data WHERE userid = ?`;
        db.get(query, [userid], (err, row) => {
            if (err) {
                console.log(err);
                return;
            }
            if (row === undefined) {
                let insertdata = db.prepare(`INSERT INTO data VALUES(?,?,?)`);
                insertdata.run(userid, uname, "none");
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
        let word = msg.slice(8);
        db.run(`UPDATE data SET word = ? WHERE userid = ?`, [word, userid]);
        console.log("done");
    }
});
client.login("token");