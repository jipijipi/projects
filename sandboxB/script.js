function chances(items) {
    let gottem = [];
    let tries = 0;

    while (gottem.length < items) {
        let num = Math.floor(Math.random() * items) + 1;

        if (gottem.indexOf(num) == -1) gottem.push(num);

        tries++;
    }

    return tries;
}

function aver(tries = 16, sample = 100000) {
    let values = [];

    for (let i = 0; i < sample; i++) {
        values.push(chances(tries));
    }

    let valuesSort = values.sort();
    let mid = Math.ceil(valuesSort.length / 2);
    let median = valuesSort.length % 2 === 0 ? (valuesSort[mid] + valuesSort[mid - 1]) / 2 : valuesSort[mid - 1];

    console.log({ average: values.reduce((a, b) => a + b) / sample, median, max: Math.max(...values), min: Math.min(...values) });
    console.log({
        average: (values.reduce((a, b) => a + b) / sample) * 3 + ' €',
        median: median * 3 + ' €',
        max: Math.max(...values) * 3 + ' €',
        min: Math.min(...values) * 3 + ' €',
    });
}
