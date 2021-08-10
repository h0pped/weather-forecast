let currentTemperatureEl = document.querySelector("#current-temperature")
let currentCityEl = document.querySelector("#current-city")
let currentCountryEl = document.querySelector("#current-country")
let currentDateEl = document.querySelector("#current-date")
let currentCloudsEl = document.querySelector("#current-clouds")
let currentImageEl = document.querySelector("#current-img")
let daysCards = document.querySelectorAll(".card")
let uvIndexEl = document.querySelector("#uv-index")
let uvIndexBar = document.querySelector(".uv-bar .filled-bar")
let windEl = document.querySelector("#wind-speed")
let windDescription = document.querySelector("#wind-description")
let sunriseEl = document.querySelector("#sunrise")
let sunsetEl = document.querySelector("#sunset")
// let currentRainChanceEl = document.querySelector("#current-rain-chance")
let city,country
let weatherResponse
let timestamp
console.log(daysCards);
const DAYS = {
    0: "Sunday",
    1: "Monday",
    2: "Tuesday",
    3: "Wednesday",
    4: "Thursday",
    5: "Friday",
    6: "Saturday"
}
const WEATHERPATHS = {
    "Clouds": "cloud",
    "Thunderstorm": "thunderstorm",
    "Drizzle": "rain",
    "Rain": "rain",
    "Snow": "snow",
    "Mist": "haze",
    "Smoke": "haze",
    "Dust": "haze",
    "Fog": "haze",
    "Sand": "haze",
    "Dust": "haze",
    "Ash": "haze",
    "Squall": "haze",
    "Tornado": "hurricane",
    "Clear": "sun"
}
const WINDSPEED = {
    0: "Windless",
    5: "Little Breeze",
    10: "Breeze",
    20: "Windy",
    30: "Strong wind"
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
    let timestamp = weatherResponse.current.dt+weatherResponse.timezone_offset
    currentImageEl.src=`./images/${WEATHERPATHS[current.weather[0].main]}.png`
    currentTemperatureEl.innerHTML = `${getCelsius(current.temp)}<sup class="degree">°</sup>C`
    currentCityEl.innerHTML = city
    currentCountryEl.innerHTML = country
    let date = new Date(timestamp*1000)
    currentDateEl.innerHTML = `${DAYS[date.getUTCDay().toString()]}, <span class="gray-text">${date.getUTCHours().toString().padStart(2,"0")}:${date.getUTCMinutes().toString().padStart(2,"0")}</span>`
    currentCloudsEl.innerHTML = `Clouds: ${current.clouds}%`
    for(let i = 0;i<daysCards.length;i++){
        let day_forecast = weatherResponse.daily[i+1]
        daysCards[i].querySelector('p.weekday').innerHTML = getDay(day_forecast.dt)
        daysCards[i].querySelector('img').src = `./images/${WEATHERPATHS[day_forecast.weather[0].main]}.png`
        daysCards[i].querySelector('p.degree-description').innerHTML = `${getCelsius(day_forecast.temp.max)}<sup class="degree">°</sup> <span class="gray-text">${getCelsius(day_forecast.temp.min)}<sup class="degree">°</sup></span>`
    }
    uvIndexEl.innerHTML = current.uvi.toFixed(0)
    uvIndexBar.style.width = current.uvi.toFixed(0)*10+"%"
    windEl.innerHTML = current.wind_speed.toFixed(0)
    windDescription.innerHTML = getWindDescription(current.wind_speed)

    sunsetEl.innerHTML = getTime(current.sunset,weatherResponse.timezone_offset)
    sunriseEl.innerHTML = getTime(current.sunrise,weatherResponse.timezone_offset)
}

const getDay = (timestamp)=> DAYS[new Date(timestamp*1000).getUTCDay()]
getTime = (timestamp,offset)=>{
    let date = new Date((timestamp+offset)*1000)
    return `${date.getUTCHours().toString().padStart(2,"0")}:${date.getUTCMinutes().toString().padStart(2,"0")}`
}
const getCelsius = (calvins)=> (calvins-273.15).toFixed(1)
const getWindDescription = (speed)=>{
    let keys = Object.keys(WINDSPEED)
    for(let i = 0;i<keys.length;i++){
        if(speed<=+keys[i]){
            return WINDSPEED[keys[i]]
        }
    }
    return "Dangerous Wind"
}
// fetch("https://api.openweathermap.org/data/2.5/onecall?lat=50.619900&lon=26.251617&exclude=hourly&appid=e6d804f5e9320c6522624536e3ac2b78").then(res=>res.json())
// .then(data=>console.log(data))

// https://api.openweathermap.org/data/2.5/onecall?lat={lat}&lon={lon}&exclude={part}&appid={API key}

// http://api.openweathermap.org/geo/1.0/reverse?lat=51.5098&lon=-0.1180&limit=5&appid={API key}
