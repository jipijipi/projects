const EventEmitter = require('events');

const myEmitter = new EventEmitter();

myEmitter.on('newSale', () => console.log('new sale'));

myEmitter.on('newSale', () => console.log('new sale fo realz !'));

myEmitter.on('newSale', (x) => console.log(`${x} sale fo realz !`));

myEmitter.emit('newSale', 9);