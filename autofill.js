//autofill by MetalRain682237#4905

const cmdlist = { //be sure to set up your command list in this format, this could also be a json file instead
    list: ["buy", "ping"],

    buy: {
        list: ["dogs", "duck", "metal"],

        dogs: {
            list: ["max"]
        }
    }
}

function autofill(message, args) { //autofill in commands
    return new Promise(resolve => {
        let cmd = 0; //which command we are figuring out
        let possible = new Array(); //possible commands
        let numpossible = 0; //number of possible commands
        let finalcmd = new Array(); //what the actual args are
        let cmds; //used for the dynamic list of commands
        let gtg = true; //when to stop trying to autocorrect

        for (let i = 0; i < args.length; i++) {
            if (cmd == 0) {
                cmds = cmdlist.list;
            } else if ((cmd == 1) && (cmdlist[finalcmd[0]] !== undefined)) {
                cmds = cmdlist[finalcmd[0]].list;
            } else if ((cmd == 2) && (cmdlist[finalcmd[0]][finalcmd[1]] !== undefined)) {
                cmds = cmdlist[finalcmd[0]][finalcmd[1]].list;
            } else if ((cmd == 3) && (cmdlist[finalcmd[0]][finalcmd[1]][finalcmd[2]] !== undefined)) {
                cmds = cmdlist[finalcmd[0]][finalcmd[1]][finalcmd[2]].list;
            } else { //if we got here it means that the command has no more arguments
                gtg = false;
            }
            if ((gtg == true) && ((cmds.indexOf(args[cmd]) != -1) || (!isNaN(args[cmd])))) { //if this is a number or completely matches a command
                finalcmd.push(args[cmd]);
                cmd++;
                continue; //skip to next iteration of the loop
            }
            if ((cmd == args.length) || (gtg == false) || (cmds === undefined)) {
                let returnargs = args.splice(finalcmd.length, args.length);
                for (let i = (finalcmd.length - 1); i > -1; i--) {
                    returnargs.unshift(finalcmd[i]);
                }
                return resolve(returnargs);
            }
            let i2 = args[i].length;
            do {
                for (let i3 = 0; i3 < cmds.length; i3++) {
                    if (args[cmd].substring(0, i2) == cmds[i3].substring(0, i2)) {
                        numpossible++;
                        possible.push(cmds[i3]);
                    }
                }
                i2--;
            } while ((numpossible == 0) && (i2 > 0));
            if (numpossible > 1) { //multiple possible
                message.delete();
                message.channel.send("There were multiple commands you may have meant by `" + (args.join(" ")) + "`, possible ones: `" + (possible.join("`, `")) + "`");
                return resolve(null);
            } else if (numpossible == 1) { //only one command it can be
                finalcmd.push(possible[0]);
                numpossible = 0;
                possible = new Array();
                cmd++;
            } else { //no possible so just add the whole word
                finalcmd.push(args[cmd]);
            }
        }
        if (finalcmd.length < args.length) {
            message.delete();
            message.channel.send("I am not sure what you are trying to do");
            return resolve(null);
        } else {
            return resolve(finalcmd);
        }
    });
}

module.exports.autofill = autofill;