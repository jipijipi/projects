console.log('start');

async function fetchWeatherData(location) {
    let data = await fetch(`http://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=056ab298b626bc49cbfab81f54e9bb97`);
    let formattedData = await data.json();
    console.log(dataParse(formattedData));
}

fetchWeatherData('paris');

function dataParse(json) {
    return {
        city: json.name,
        temperature: json.main.temp,
        cloudy: json.clouds.all,
        windy: json.wind.speed,
    };
}

let submitButton = document.body.querySelector('#queryBtn');
let cityName = document.body.querySelector('#city');

submitButton.addEventListener('click', () => fetchWeatherData(cityName.value));
