const fs = require('fs');

let MeArr = ['zap', 'zip', 'zoop', 'bip', 'bap',];

console.log(MeArr.entries());

for (let [i, prop] of MeArr.entries()) {


    fs.writeFile(`${prop}.txt`, `${prop} mo fillu number ${i + 1}`, function (err) {
        if (err) throw err;
        console.log(prop);
    });


}