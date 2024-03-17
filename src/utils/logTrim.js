const fs = require('fs');
const path = require('path');

const logFilePath = path.join(__dirname, '..', 'log.txt');
const maxLogSize = 50 * 1024 * 1024;
const trimSize = 10 * 1024 * 1024;

function findTrimPoint(data) {
  const logEntryStartRegex = /\[\d{2}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2}\]/;
  for (let i = trimSize; i > 0; i--) {
    if (logEntryStartRegex.test(data.substring(i - 1))) {
      return i;
    }
  }
  return trimSize;
}

const trimLogFile = () => {
  fs.stat(logFilePath, (err, stats) => {
    if (err) {
      console.error('Error accessing log file:', err);
      return;
    }

    if (stats.size > maxLogSize) {
      fs.readFile(logFilePath, 'utf8', (err, data) => {
        if (err) {
          console.error('Error reading log file:', err);
          return;
        }

        const trimPoint = findTrimPoint(data);
        const trimmedData = data.slice(trimPoint);

        fs.writeFile(logFilePath, trimmedData, 'utf8', (err) => {
          if (err) {
            console.error('Error writing trimmed data back to log file:', err);
          } else {
            console.log('Log file trimmed successfully.');
          }
        });
      });
    } else {
      console.log('Log file size is within limits. No trimming needed.');
    }
  });
};

module.exports = trimLogFile;
