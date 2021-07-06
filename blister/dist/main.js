let totalNumberOfItems = 50;
let itemsPerBlister = 5;

function chances(totalItems, blisterItems) {
    let tries = 0;
    let itemSet = new Set();
    while (itemSet.size < totalItems) {
        let item = Math.floor(Math.random() * totalItems) + 1;
        itemSet.add(item);
        tries++;
    }
    return Math.ceil(tries / blisterItems);
}

function stats(numberOfSamples, totalItems, blisterItems, price) {
    let resultArray = [];
    for (i = 0; i < numberOfSamples; i++) {
        resultArray.push(chances(totalItems, blisterItems));
    }
    let result = Math.ceil(resultArray.reduce((x, y) => x + y) / resultArray.length);
    console.log(...resultArray);
    console.log({
        max: Math.max(...resultArray),
        'coût max(€)': Math.max(...resultArray) * price,
        min: Math.min(...resultArray),
        'coût min(€)': Math.min(...resultArray) * price,
        tentatives: result,
        'coût(€)': result * price,
    });
    return result;
}
