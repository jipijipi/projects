console.log('start');

async function fetchWeatherData(location) {
    let data = await fetch(`http://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=056ab298b626bc49cbfab81f54e9bb97`);
    let formattedData = await data.json();
    console.log(formattedData);
    console.log(dataParse(formattedData));
    changeInfo(dataParse(formattedData));
}

fetchWeatherData('paris');

function dataParse(json) {
    return {
        city: json.name,
        temperature: json.main.temp,
        cloudy: json.clouds.all,
        windy: json.wind.speed,
        condition: json.weather[0].description,
        icon: json.weather[0].icon,
    };
}

function changeInfo(obj) {
    let title = document.body.querySelector('h1');
    let condition = document.body.querySelector('h2');
    let icon = document.body.querySelector('#conditionIcon');

    title.innerHTML = obj.city;
    condition.innerHTML = obj.condition;
    icon.src = `http://openweathermap.org/img/wn/${obj.icon}@2x.png`;
    document.body.style.backgroundColor = rgbValue(obj.temperature);
}

function map_range(value, low1, high1, low2, high2) {
    return low2 + ((high2 - low2) * (value - low1)) / (high1 - low1);
}

function rgbValue(temperature) {
    let lowColor = [121, 132, 255];
    let highColor = [255, 94, 11];

    let tempRange = [0, 40];

    let R = Math.round(map_range(temperature, tempRange[0], tempRange[1], lowColor[0], highColor[0]));
    let G = Math.round(map_range(temperature, tempRange[0], tempRange[1], lowColor[1], highColor[1]));
    let B = Math.round(map_range(temperature, tempRange[0], tempRange[1], lowColor[2], highColor[2]));

    return `rgb(${R},${G},${B})`;
}

let submitButton = document.body.querySelector('#queryBtn');
let cityName = document.body.querySelector('#city');

submitButton.addEventListener('click', () => fetchWeatherData(cityName.value));

function addCircles() {
    for (let i = 0; i < 40; i++) {
        let div = document.createElement('DIV');
        div.setAttribute('class', 'color');
        div.style.backgroundColor = rgbValue(i);
        document.body.querySelector('#grade').appendChild(div);
    }
}

addCircles();
