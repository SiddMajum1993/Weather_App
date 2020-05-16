"use strict";

/** Constant Variables Here */
const API_KEY = "27a7cbf570ab1f5525e25460913b00c7";
const KELVIN_CONST = 273.15;
const DEGREE = "&#8451";
const PERCENT = "&#37";

let stroage = window.localStorage;
let today = new Date();
// const cityNames = stroage.getItem('cityNames');
let cityNames = [];

/** Added event listner to button to trigger search opperation on click */
let ele = document.getElementsByClassName("city-input-container")[0];
if (ele) {
  ele
    .getElementsByClassName("city-search")[0]
    .addEventListener("click", searchCityWeather.bind(this));
}

/** Search fucntion
 * This function makes call to weather api to get details of the weather
 */
function searchCityWeather() {
  let name = ele.getElementsByClassName("city-name")[0].value;
  if (!name) return;
  let wData = getDataFromLocalStorage(name);
  if (!wData) {
    fetch(getApiURL(name))
      .then(response => response.json())
      .then(data => {
        setDataToDisplay(data);
        setDataToLocalStroage(name, data);
      })
      .catch(error => console.error(error));
  } else {
    setDataToDisplay(wData);
  }
}

/**
 * Caching functions to store fetched data
 * Storing data with lastmodified time
 * data should only update if it more that 10mins old
 */
function setDataToLocalStroage(name, data) {
  let weatherData = {
    lastModifiedDate: today.getTime(),
    data: data
  };

  stroage.setItem(name, JSON.stringify(weatherData));
}

function getDataFromLocalStorage(name) {
  let weatherData = stroage.getItem(name);
  if (!weatherData) return false;
  if (weatherData) {
    return new Date().getTime() - JSON.parse(weatherData).lastModifiedDate >
      600000
      ? false
      : JSON.parse(weatherData).data;
  }
}

/**
 * DOM manipulation function
 * this sets all the data to the dom
 */

function setDataToDisplay(data) {
  let weatherData = typeof data === "string" ? JSON.parse(data) : data;
  let curTemp = parseFloat(weatherData.main.temp - KELVIN_CONST).toFixed(0);
  let minTemp = parseFloat(weatherData.main.temp_min - KELVIN_CONST).toFixed(1);
  let maxTemp = parseFloat(weatherData.main.temp_max - KELVIN_CONST).toFixed(1);

  let iconURL =
    "http://openweathermap.org/img/wn/" +
    weatherData.weather[0].icon +
    "@2x.png";
  setWeatherICON(
    "display-weather-icon",
    iconURL,
    weatherData.weather[0].description
  );
  setDynamicValue(
    "display-city-name",
    weatherData.name + ", " + weatherData.sys.country
  );
  setDynamicValue("display-date", getDateFromUNIXtime(weatherData.dt));
  setDynamicValue("display-current-temp", curTemp + " " + DEGREE);
  setDynamicValue(
    "display-temp-min-max",
    minTemp + " " + DEGREE + "/ " + maxTemp + " " + DEGREE
  );
  setDynamicValue(
    "display-humidity",
    weatherData.main.humidity + " " + PERCENT
  );
  // setDynamicValue('display-description',weatherData.weather[0].description);
}

/**
 * Utility functions here
 */

let displayEle = document.getElementsByClassName("display")[0];

function setDynamicValue(className, value) {
  let ele = displayEle.getElementsByClassName(className)[0];
  ele.innerHTML = value;
}

function setWeatherICON(className, url, alt) {
  let iconELE = displayEle.getElementsByClassName(className)[0];
  iconELE.src = url;
  iconELE.alt = alt;
}

function getApiURL(cityName) {
  let URL =
    "https://api.openweathermap.org/data/2.5/weather?q=" +
    cityName +
    "&appid=" +
    API_KEY +
    "";
  return URL;
}

function getDateFromUNIXtime(timeStamp) {
  const date = new Date(timeStamp * 1000);
  return date.toLocaleDateString();
}

// Search weather when user presses enter

function handleKeyPress(event) {
  if (event.keyCode === 13) {
    event.preventDefault(); // Ensure it is only this code that rusn
    searchCityWeather();
  }
}

// get all the list of cities
Promise.resolve().then(() => {
  if (!(cityNames && cityNames.length))
    fetch("../data/cityList.json")
      .then(response => response.json())
      .then(data => {
        console.log(data);
        // stroage.setItem('cityNames', JSON.stringify(data));
        cityNames = [...data];
      });
});

// Debounce function

function debounce(func, wait, immediate) {
  let timeout;
  return function() {
    let context = this,
      args = arguments[0].target;
    let later = function() {
      timeout = null;
      if (!immediate) func.call(context, args);
    };
    let callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

// This functions searches all the city name based on input.

let getCityNames = debounce(function() {
  const query = ele.getElementsByClassName("city-name")[0].value;
  if (cityNames) {
    const filteredCityList = cityNames.filter(city => {
      const regex = new RegExp(`^${query}`, "gi");
      return city.name.match(regex);
    });
    console.log(filteredCityList);
  }
}, 500);

