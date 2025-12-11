// * Links the HTML elements to JavaScript Variables
const body = document.querySelector(`body`);
const searchButton = document
  .getElementById(`searchButton`)
  .addEventListener(`click`, fetchWeather);
const weatherDisplay = document.getElementById(`weatherDisplay`);
const loading = document.getElementById(`loading`);
let searchedCity;

loadLastCity();
// * Creates an Asynchronous function that requests the weather data without freezing the page by using async/await. We also use some basic error handling
async function fetchWeather() {
  const city = document.getElementById(`cityInput`).value.trim();
  searchedCity = city.split(`,`);

  // * If city is empty we show a message and exit the function
  if (!city) {
    showMessage(`Please enter a city name.`);
    return;
  }

  // * Set's the loading state to true
  toggleLoading(true);
  // * Clears the display
  clearDisplay();

  // * encodeURIComponent() helps to convert a string in to a safe hexadecimal code that web servers understand. It changes things like space ( ) to %20 and comma (,) to '%20' and ampersand (&) to %26.
  // * Without it the url would look like this: '...q=New York...'
  // * With it the url looks like this: '...q=New%20York...'
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
    city
  )}&appid=${apiKey}&units=metric`;
  console.log(url);

  // * Tries to fetch the data from the API and awaits for a response
  try {
    console.log(url);
    // * We Attempt to execute the code
    const response = await fetch(url);
    // * is the response is not okay we throw an error and exit the function
    if (!response.ok) throw new Error(`City not found`);
    localStorage.setItem(`lastSearch`, city);
    const data = await response.json();
    setTimeout(() => {
      displayWeather(data);
    }, 2000);
  } catch (err) {
    // * We handle any errors
    // * If an error is thrown, we catch it here and show the error message
    showMessage(err.message);
  } finally {
    // * We now clean up the function toggle the loading state to false and continue
    setTimeout(() => {
      toggleLoading(false);
    }, 2000);
  }
}
function displayWeather(data) {
  const name = data.name;

  // * Weather Section
  const weather = data.weather.main; // Group of weather parameters (Rain, Snow, Clouds etc.)
  const weatherDescription = data.weather[0].description; // Weather condition within the group. Please find more https://openweathermap.org/current#list
  const weatherIconCode = data.weather[0].icon;
  const weatherIcon = `https://openweathermap.org/img/wn/${weatherIconCode}@2x.png`; // Icon Link

  // * Main Section
  const temp = data.main.temp;
  const tempMin = data.main.temp_min;
  const tempMax = data.main.temp_max;
  const feelsLike = data.main.feels_like;
  const humidity = data.main.humidity; // Humidity %

  // * Wind Section
  const windSpeed = data.wind.speed; // Wind speed. Unit Default: meter/sec
  const windDirection = data.wind.speed; // Wind direction, degrees (meteorological)

  // * Dt Section
  const checkedTime = formatDateUTC(data.dt);
  const checkedTimeLocale = formatDateLocale(data.dt);
  const checkedTimeRelative = formatRelativeTime(data.dt);

  // * Sys Section
  const country = data.sys.country; // Country code (GB, JP etc.)
  const sunriseTime = data.sys.sunrise; // Sunrise time, unix, UTC
  const sunsetTime = data.sys.sunset; // Sunset time, unix, UTC

  weatherDisplay.innerHTML = `
  <img src="${weatherIcon}" alt="Weather Icon">
  <p>City: ${name}, ${country}</p>
  <p>Temperature: ${temp}°C</p>
  <p>Feels Like: ${feelsLike}°C</p>
  <p>Humidity: ${humidity}%</p>
  <p>Condition: ${weatherDescription}</p>
  <p>Last Checked: ${checkedTimeRelative}</p>
  <p>Checked at: ${checkedTime}</p>
  <p>Locale Time: ${checkedTimeLocale}</p>`;
  changeBackground(weatherDescription);
}

// * Helper functions for controlling the ui and providing feedback to the user
function showMessage(msg) {
  weatherDisplay.textContent = msg;
}
function toggleLoading(show) {
  // * Uses a Ternary Operator Structure 'Condition ? Value if True : Value if False'
  // * So it's the same as if(show = true) set the value to block, if(show = false) set the value to none
  loading.style.display = show ? `block` : `none`;
}
function clearDisplay() {
  weatherDisplay.innerHTML = ``;
  body.style.backgroundColor = "#FFFFFF";
  body.style.color = "#2B2B2B";
}
function changeBackground(description) {
  body.style.transition = `0.5s`;
  if (description.includes(`rain`)) {
    body.style.backgroundColor = "#73d0e7ff";
    body.style.color = "#353535ff";
  } else if (description.includes(`clouds`)) {
    body.style.backgroundColor = "#727272ff";
    body.style.color = "#f3f3f3ff";
  } else if (description.includes(`clear`)) {
    body.style.backgroundColor = "#FFFFFFFF";
    body.style.color = "#353535ff";
  }
}

// * Formatting Functions to convert the raw Unix Timestamps in to user-friendly readable strings by using ternary operators and the Intl.RelativeTimeFormat
function formatDateUTC(unix) {
  // * Creates a Date Object from unix timestamp and Converts seconds to milliseconds
  const date = new Date(unix * 1000);

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, `0`); // Returns an number starting at index 0. So add 1 so we get 1 = January, 11 = November etc.
  const day = String(date.getUTCDate()).padStart(2, `0`);
  const hours = date.getUTCHours();
  const minutes = String(date.getUTCMinutes()).padStart(2, `0`);
  const seconds = String(date.getUTCSeconds()).padStart(2, `0`);
  let hours12;
  let ampm;

  // * If hours is less than 12 we use AM. If it's greater than 12 we use PM and use the ternary operator structure to subtract 12.
  if (hours < 12) {
    ampm = `AM`;
    // * Uses a Ternary Operator Structure 'Condition ? Value if True : Value if False'
    // * So it's the same as if(hours12 === 0) set the value to 12, if(hours12 !== 0) set the value to hours
    hours12 = hours === 0 ? 12 : hours;
  } else {
    ampm = `PM`;
    // * Uses a Ternary Operator Structure 'Condition ? Value if True : Value if False'
    // * So it's the same as if(hours12 === 12) set the value to 12, if(hours12 !== 12) set the value to hours - 12
    hours12 = hours === 12 ? 12 : hours - 12;
  }

  const fullDate = `${hours12}:${minutes}:${seconds} ${ampm} on ${day}/${month}/${year}`;
  return fullDate;
}
function formatDateLocale(unix) {
  const date = new Date(unix * 1000);
  const timeLocale = date.toLocaleTimeString();
  const dateLocale = date.toLocaleDateString();
  const fullTimeDate = `${timeLocale} on ${dateLocale}`;
  return fullTimeDate;
}
function formatRelativeTime(unix) {
  // * Creates a Date Object from unix timestamp and Converts seconds to milliseconds
  const date = new Date(unix * 1000);
  const now = new Date();
  const differenceInSeconds = (now.getTime() - date.getTime()) / 1000;
  // * Sets up the relative time formatter
  const formatter = new Intl.RelativeTimeFormat("en-GB");

  let totalSeconds = Math.floor(differenceInSeconds);
  let totalMinutes = Math.floor(totalSeconds / 60);
  let totalHours = Math.floor(totalSeconds / (60 * 60));
  let totalDays = Math.floor(totalSeconds / (24 * 60 * 60));
  let relativeTime;

  // * Checks the highest unit of time we will be using
  // * Passes the negative value of the total unit to the formatter (+ = in x days, - = days ago etc.)
  // * Tells the formatter which unit to display
  if (totalDays > 0) {
    relativeTime = formatter.format(-totalDays, `day`);
  } else if (totalHours > 0) {
    relativeTime = formatter.format(-totalHours, `hour`);
  } else if (totalMinutes > 0) {
    relativeTime = formatter.format(-totalMinutes, `minute`);
  } else {
    relativeTime = formatter.format(-totalSeconds, `second`);
  }

  // * Returns the formatted relative time (e.g. 8 Minutes ago)
  return relativeTime;

  // * The code below worked perfectly, but I found a cleaner solution that I have used above
  // let remainingSeconds = totalSeconds % 60;
  // let remainingMinutes = totalMinutes % 60;
  // let remainingHours = totalHours % 24;
  // if (totalDays > 0) {
  //   relativeTime = `${totalDays}d, ${remainingHours}h, ${remainingMinutes}m, ${remainingSeconds}s ago`;
  // } else if (totalHours > 0) {
  //   relativeTime = `${remainingHours}h, ${remainingMinutes}m, ${remainingSeconds}s ago`;
  // } else if (totalMinutes > 0) {
  //   relativeTime = `${remainingMinutes}m, ${remainingSeconds}s ago`;
  // } else {
  //   relativeTime = `${remainingSeconds}s ago`;
  // }
}

// * Load Local Storage
function loadLastCity() {
  const lastCity = localStorage.getItem(`lastSearch`);
  if (lastCity) {
    document.getElementById(`cityInput`).value = lastCity;
    fetchWeather();
  }
  return;
}
