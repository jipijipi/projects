console.log('start');

async function fetchWeatherData(location) {
    let data = await fetch(`http://api.openweathermap.org/data/2.5/weather?q=${location}&appid=056ab298b626bc49cbfab81f54e9bb97`);
    let formattedData = await data.json();
    console.log(formattedData);
}

fetchWeatherData('paris');

function dataParse(json) {}
