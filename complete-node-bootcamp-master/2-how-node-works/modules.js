//console.log(arguments);

const Calc = require('./test-module-1');

const calc1 = new Calc();

console.log(calc1);
console.log(calc1.add(2, 5));

//const calc2 = require('./test-module-2');
const { add, multiply, divide } = require('./test-module-2');
console.log(multiply(2, 4));

//

require('./test-module-3')();
require('./test-module-3')();
require('./test-module-3')();