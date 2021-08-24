let currentTemperatureEl = document.querySelector("#current-temperature");
let currentCityEl = document.querySelector("#current-city");
let currentCountryEl = document.querySelector("#current-country");
let currentDateEl = document.querySelector("#current-date");
let currentCloudsEl = document.querySelector("#current-clouds");
let currentImageEl = document.querySelector("#current-img");
let daysCards = document.querySelectorAll(".card");
let uvIndexEl = document.querySelector("#uv-index");
let uvIndexBar = document.querySelector(".uv-bar .filled-bar");
let windEl = document.querySelector("#wind-speed");
let windDescription = document.querySelector("#wind-description");
let sunriseEl = document.querySelector("#sunrise");
let sunsetEl = document.querySelector("#sunset");
let humidityEl = document.querySelector("#humidity");
let humidityIndexBar = document.querySelector(".humidity-bar .filled-bar");
let visibilityEl = document.querySelector("#visibility");
let visibilityDescriptionEl = document.querySelector("#visibility-description");
let maxTempEl = document.querySelector("#max");
let minTempEl = document.querySelector("#min");
let mainInfoEl = document.querySelector("#main-info");
let placeInputEl = document.querySelector("#placeInput");
let searchResultsEl = document.querySelector(".search-results-container");
let searchListEl = document.querySelector(".search-list");
let loaderEl = document.querySelector(".loader-div");

let city, country;
let weatherResponse;
let timestamp;
let searchTimeout;

let WEATHER_TOKEN = config.WEATHER_TOKEN;
let PLACES_TOKEN = config.PLACES_TOKEN;
let MAP_TOKEN = config.MAP_TOKEN;
mapboxgl.accessToken = MAP_TOKEN;
let map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/streets-v11",
  // center: [long, lat], // starting position [lng, lat]
  zoom: 7, // starting zoom
});

const DAYS = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
};
const WEATHERPATHS = {
  Clouds: "cloud",
  Thunderstorm: "thunderstorm",
  Drizzle: "rain",
  Rain: "rain",
  Snow: "snow",
  Mist: "haze",
  Smoke: "haze",
  Dust: "haze",
  Fog: "haze",
  Sand: "haze",
  Dust: "haze",
  Ash: "haze",
  Squall: "haze",
  Tornado: "hurricane",
  Clear: "sun",
};
const WINDSPEED = {
  0: "Windless",
  5: "Little Breeze",
  10: "Breeze",
  20: "Windy",
  30: "Strong wind",
};
const VISIBILITY = {
  1: "Dangerous visibility",
  2: "Low visibility",
  5: "Normal Visibility",
  10: "Good visibility",
};

const rect = document.querySelector("body").getBoundingClientRect();
if (
  !(
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  )
) {
  loaderEl.style.display = "none";
}

placeInputEl.addEventListener("input", () => {
  clearTimeout(searchTimeout);
  if (!placeInputEl.value) {
    searchResultsEl.style.display = "none";
  } else {
    searchTimeout = setTimeout(() => {
      searchPlaces(placeInputEl.value);
    }, 500);
  }
});

function searchPlaces(place) {
  fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${place}.json?limit=5&access_token=${PLACES_TOKEN}`
  )
    .then((res) => res.json())
    .then((data) => {
      searchResultsEl.style.display = "block";
      searchListEl.innerHTML = "";
      if (data.features.length === 0) {
        throw "Not found!";
      }
      data.features.forEach((el) => {
        let place = document.createElement("li");
        let placename = document.createElement("p");
        placename.innerHTML = el.place_name;
        let [long, lat] = el.center;
        place.setAttribute("data-lat", lat);
        place.setAttribute("data-long", long);
        place.appendChild(placename);
        searchListEl.appendChild(place);
      });
    })
    .catch((err) => {
      searchResultsEl.style.display = "block";
      searchListEl.innerHTML = "";
      let place = document.createElement("li");
      let notFound = document.createElement("p");
      place.appendChild(notFound);
      notFound.innerHTML = "No places were found!";
      notFound.classList.add("disabled");
      searchListEl.appendChild(notFound);
    });
}

function getPosition(lat, long) {
  fetch(
    `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${long}&limit=1&appid=${WEATHER_TOKEN}`
  )
    .then((res) => res.json())
    .then((data) => {
      country = data[0].country;
      city = data[0].name;
      getForecast(lat, long);
    });
}
function getForecast(lat, long) {
  fetch(
    `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${long}&exclude=hourly&appid=${WEATHER_TOKEN}`
  )
    .then((res) => res.json())
    .then((data) => {
      weatherResponse = data;
      updateUI();
    });
}

navigator.geolocation.getCurrentPosition(
  (res) => {
    let { latitude: lat, longitude: long } = res.coords;
    getPosition(lat, long);
  },
  (err) => {
    console.log(err);
  }
);

function updateUI() {
  let current = weatherResponse.current;
  let timestamp = weatherResponse.current.dt + weatherResponse.timezone_offset;
  currentImageEl.src = `./images/${WEATHERPATHS[current.weather[0].main]}.png`;
  currentTemperatureEl.innerHTML = `${getCelsius(
    current.temp
  )}<sup class="degree">°</sup>C`;
  currentCityEl.innerHTML = city;
  currentCountryEl.innerHTML = country;
  let date = new Date(timestamp * 1000);
  currentDateEl.innerHTML = `${
    DAYS[date.getUTCDay().toString()]
  }, <span class="gray-text">${date
    .getUTCHours()
    .toString()
    .padStart(2, "0")}:${date
    .getUTCMinutes()
    .toString()
    .padStart(2, "0")}</span>`;
  currentCloudsEl.innerHTML = `Clouds: ${current.clouds}%`;
  for (let i = 0; i < daysCards.length; i++) {
    let day_forecast = weatherResponse.daily[i + 1];
    daysCards[i].querySelector("p.weekday").innerHTML = getDay(day_forecast.dt);
    daysCards[i].querySelector("img").src = `./images/${
      WEATHERPATHS[day_forecast.weather[0].main]
    }.png`;
    daysCards[i].querySelector(
      "p.degree-description"
    ).innerHTML = `${getCelsius(
      day_forecast.temp.max
    )}<sup class="degree">°</sup> <span class="gray-text">${getCelsius(
      day_forecast.temp.min
    )}<sup class="degree">°</sup></span>`;
  }
  uvIndexEl.innerHTML = current.uvi.toFixed(0);
  uvIndexBar.style.width = current.uvi.toFixed(0) * 10 + "%";
  windEl.innerHTML = current.wind_speed.toFixed(0);
  windDescription.innerHTML = getWindDescription(current.wind_speed);

  sunsetEl.innerHTML = getTime(current.sunset, weatherResponse.timezone_offset);
  sunriseEl.innerHTML = getTime(
    current.sunrise,
    weatherResponse.timezone_offset
  );

  humidityEl.innerHTML = current.humidity;
  humidityIndexBar.style.width = current.humidity.toFixed(0) + "%";

  visibilityEl.innerHTML = (current.visibility / 1000).toFixed(0);
  visibilityDescriptionEl.innerHTML = getVisibilityDescription(
    (current.visibility / 1000).toFixed(1)
  );

  maxTempEl.innerHTML = `${getCelsius(
    weatherResponse.daily[0].temp.max
  )}<sup>°</sup>`;
  minTempEl.innerHTML = `${getCelsius(
    weatherResponse.daily[0].temp.min
  )}<sup>°</sup>`;
  mainInfoEl.innerHTML =
    current.weather[0].description.slice(0, 1).toUpperCase() +
    current.weather[0].description.slice(1);
  map.flyTo({
    center: [weatherResponse.lon, weatherResponse.lat],
  });
  document.querySelector(".container").classList.remove("loading");
  loaderEl.classList.remove("active");
  loaderEl.classList.add("closed");
}

const getDay = (timestamp) => DAYS[new Date(timestamp * 1000).getUTCDay()];
getTime = (timestamp, offset) => {
  let date = new Date((timestamp + offset) * 1000);
  return `${date.getUTCHours().toString().padStart(2, "0")}:${date
    .getUTCMinutes()
    .toString()
    .padStart(2, "0")}`;
};
const getCelsius = (calvins) => (calvins - 273.15).toFixed(0);
const getVisibilityDescription = (visibility) => {
  let keys = Object.keys(VISIBILITY);
  for (let i = 0; i < keys.length; i++) {
    if (visibility <= +keys[i]) {
      return VISIBILITY[keys[i]];
    }
  }
  return "Dangerous Wind";
};
const getWindDescription = (speed) => {
  let keys = Object.keys(WINDSPEED);
  for (let i = 0; i < keys.length; i++) {
    if (speed <= +keys[i]) {
      return WINDSPEED[keys[i]];
    }
  }
  return "Dangerous Wind";
};

searchListEl.addEventListener("click", (e) => {
  const clicked = e.target.closest("li");
  if (clicked) {
    searchResultsEl.style.display = "none";
    document.querySelector(".container").classList.add("loading");
    loaderEl.classList.remove("closed");
    loaderEl.classList.add("active");
    getPosition(clicked.dataset.lat, clicked.dataset.long);
  }
});

// map: pk.eyJ1IjoiYXdyaWwiLCJhIjoiY2tyOTRnaHkwMGl2YjJwcDhoYmhkdWNxaiJ9.XlGjFeM6ofVunfyStLiFmQ
