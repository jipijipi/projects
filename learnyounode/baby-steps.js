let sum = process.argv.filter((x) => !isNaN(+x)).reduce((x, y) => +x + +y);

console.log(sum);
