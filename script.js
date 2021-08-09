let currentTemperatureEl = document.querySelector("#current-temperature")
let currentCityEl = document.querySelector("#current-city")
let currentCountryEl = document.querySelector("#current-country")
let currentDateEl = document.querySelector("#current-date")
let currentCloudsEl = document.querySelector("#current-clouds")
let currentImageEl = document.querySelector("#current-img")
// let currentRainChanceEl = document.querySelector("#current-rain-chance")
let city,country
let weatherResponse
let timestamp

const DAYS = {
    1: "Monday",
    2: "Tuesday",
    3: "Wednesday",
    4: "Thursday",
    5: "Friday",
    6: "Saturday",
    7: "Sunday",
}
const WEATHERPATHS = {
    "Clouds": "cloud"
}
function getPosition(lat,long){
    fetch(`http://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${long}&limit=1&appid=e6d804f5e9320c6522624536e3ac2b78`).then(res=>res.json())
    .then(data=>{
        console.log(data);
        country = data[0].country;
        city = data[0].name
        getForecast(lat,long)
    })
}
function getForecast(lat,long){
    fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${long}&exclude=hourly&appid=e6d804f5e9320c6522624536e3ac2b78`).then(res=>res.json())
    .then(data=>{
        console.log(data);
        weatherResponse = data;
        updateUI()
    })
}
navigator.geolocation.getCurrentPosition((res)=>{
    let {latitude:lat,longitude:long} = res.coords 
    getPosition(lat,long)
},(err)=>{
    console.log(err);
})

function updateUI(){
    let current = weatherResponse.current
    let timestamp = weatherResponse.current.dt
    currentImageEl.src=`./images/${WEATHERPATHS[current.weather[0].main]}.png`
    currentTemperatureEl.innerHTML = `${(current.temp-273.15).toFixed(1)}<sup class="degree">°</sup>C`
    currentCityEl.innerHTML = city
    currentCountryEl.innerHTML = country
    let date = new Date(timestamp)
    currentDateEl.innerHTML = `${DAYS[date.getDay().toString()]}, <span class="gray-text">${date.getHours()}:${date.getMinutes()}</span>`
    currentCloudsEl.innerHTML = `Clouds: ${current.clouds}%`
    
}


// fetch("https://api.openweathermap.org/data/2.5/onecall?lat=50.619900&lon=26.251617&exclude=hourly&appid=e6d804f5e9320c6522624536e3ac2b78").then(res=>res.json())
// .then(data=>console.log(data))

// https://api.openweathermap.org/data/2.5/onecall?lat={lat}&lon={lon}&exclude={part}&appid={API key}

// http://api.openweathermap.org/geo/1.0/reverse?lat=51.5098&lon=-0.1180&limit=5&appid={API key}
