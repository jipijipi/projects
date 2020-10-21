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
    console.log(this);
    let count = +this.innerHTML;
    count += 2;
    this.innerHTML = count;
    localStorage.count = count;
}

function clearStorage() {
    localStorage.clear();
    location.reload();
}

let counter = document.querySelector('#count');

localStorage.count ? (counter.innerHTML = localStorage.count) : 0;
counter.addEventListener('click', addCounter);
