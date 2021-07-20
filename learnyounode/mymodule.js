module.exports = function (directory, extension, cb) {
    const fs = require('fs');
    let result = [];
    let regex = new RegExp(`\\.${extension}$`, 'g');
    fs.readdir(directory, function doneReading(err, data) {
        if (err) throw err;
        console.log(directory);
        console.log(data);

        result = data.filter((x) => x.match(regex));
    });
    console.log(result + 'r');

    return result;
};
