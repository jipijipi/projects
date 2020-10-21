document.title = 'Sandbooox';
document.querySelector('h1').textContent = 'Hi Sandy';

document.querySelector('#reset').addEventListener('click', clearStorage);

function addDate() {
    let today = new Date();
    let div = document.createElement('span');
    div.innerHTML = today;
    document.body.append(div);
}

function addCounter() {
    let count = +self.innerHTML;
    count += 2;
    self.innerHTML = count;
    localStorage.count = count;
}

function clearStorage() {
    localStorage.clear();
    location.reload();
}

let counter = document.querySelector('#count');

localStorage.count ? (counter.innerHTML = localStorage.count) : localStorage.setItem('count', 0);
counter.addEventListener('click', function yo() {
    self = this;
    addCounter();
    addDate();
});

function privateTest() {
    let funcOne = () => 1;

    let funcTwo = () => {
        console.log(funcOne());
        return 2;
    };

    return { funcTwo };
}

let calc = (() => {
    let add = (a, b) => a + b;
    let sub = (a, b) => a - b;
    let mul = (a, b) => a * b;
    let div = (a, b) => a / b;
    return { add, sub, mul, div };
})();
console.log(calc);
