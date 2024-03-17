const fs = require('fs');
const path = require('path');

class Logger {
    constructor(rootCause = 'UNSPECIFIED') {
        this.rootCause = rootCause;
    }

    setRoot(rc) {
        this.rootCause = rc;
    }

    res({msg, status = null, error = null, res = null}) {
        const dateTime = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '').split('-').join('/').slice(2);
        let logMessage = `[${dateTime}] [${this.rootCause}] [${status ? status : 'INFO'}] ${msg}`;
    
        if (error) {
            console.log(`${logMessage}\n${error}`);
            logMessage += `\n${error}\n`;
        } else {
            console.log(logMessage);
            logMessage += '\n';
        }
    
        fs.appendFile(path.join(__dirname, '..', 'log.txt'), logMessage, (err) => {
            if (err) throw err;
        });
    
        if (res && status !== null) {
            res.status(status).send(`[${dateTime}] [${this.rootCause}] [${status}] ${msg}`);
        }
    }    
}

module.exports = (rootCause) => new Logger(rootCause);
