let timeEl = document.getElementById("time");
let dateEl = document.getElementById("date");
let cityEl = document.getElementById("city");
let weatherEls = document.querySelectorAll(".weather");
let dateWeatherEl = document.getElementById("current_date_weather");
let textBox = document.getElementById("textbox");
let searchBtn = document.getElementById("search_btn");

const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const API_KEY = "03242ec5b71b59f75fd6b9e5a8dede18";
setInterval(() => {
  const time = new Date();
  const month = time.getMonth();
  const date = time.getDate();
  const day = time.getDay();
  const hour = time.getHours();
  const hr12format = hour >= 13 ? hour - 12 : hour;
  const minutes = time.getMinutes();
  const min2dig = minutes < 10 ? "0" + minutes : minutes;
  const ampm = hour >= 12 ? "PM" : "AM";
  timeEl.innerHTML = hr12format + ":" + min2dig + " " + ampm;
  dateEl.innerHTML = days[day] + ", " + date + " " + months[month];
}, 1000);

getWeatherData();

function getWeatherData() {
  const defaultCity = "New Delhi";
  navigator.geolocation.getCurrentPosition(
    (success) => {
      let { latitude, longitude } = success.coords;
      fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
      )
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
          showForecast(data);
          plotGraph(data);
        });
    },
    (error) => {
      checkWeather(defaultCity);
    }
  );
}

searchBtn.addEventListener("click", () => {
  checkWeather(textBox.value);
});

function checkWeather(city) {
  if (city) {
    fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`
    )
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        showForecast(data);
        plotGraph(data);
      });
  }
}

function showForecast(data) {
  const now = new Date();
  const hours = now.getHours();
  const timeslot = hours - (hours % 3);
  const next5daydata = [];

  data.list.forEach((entry) => {
    const entryDate = entry.dt_txt;
    const entryHours = Number(entryDate.split(" ")[1].split(":")[0]);
    if (entryHours === timeslot) {
      next5daydata.push(entry);
    }
  });
  console.log(next5daydata);
  let city = data.city.name;
  cityEl.innerHTML = city;

  next5daydata.forEach((entry, index) => {
    if (index <= weatherEls.length) {
      let weatherEl = weatherEls[index];
      let humidity = entry.main.humidity;
      let wind_speed = entry.wind.speed;
      let temp = entry.main.temp;
      let logo = entry.weather[0].icon;
      weatherEl.querySelector(".date").innerHTML = window
        .moment(entry.dt * 1000)
        .format("ddd");
      weatherEl.querySelector(
        ".weather_icon"
      ).innerHTML = `<img src="https://openweathermap.org/img/wn/${logo}@2x.png" />`;
      weatherEl.querySelector(".weather_info").innerHTML = `<h2>${temp}°C</h2>
            <p>Humidity: ${humidity}% <br />Wind Speed: ${wind_speed}</p>`;
    }
  });
}
let tempChart = null;
let humidityChart = null;
function plotGraph(data) {
  let temp = data.list.map((entry) => entry.main.temp);
  let humdt = data.list.map((entry) => entry.main.humidity);
  let time = data.list.map((entry) =>
    entry.dt_txt.replace(
      /^(\d{4})-(\d{2})-(\d{2}) (\d{2}:\d{2}).*$/,
      "$3-$2 $4"
    )
  );
  let graph1 = document.getElementById("temp_change");
  let graph2 = document.getElementById("humidity_change");
  if (tempChart) {
    tempChart.destroy();
  }
  if (humidityChart) {
    humidityChart.destroy();
  }
  tempChart = new Chart(graph1, {
    type: "line",
    data: {
      labels: time,
      datasets: [
        {
          label: "Temperature",
          data: temp,
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: false,
        },
      },
      plugins: {
        title: {
          display: true,
          text: "Change in temperature",
          padding: {
            top: 10,
            bottom: 30,
          },
          font: {
            size: 20,
          },
        },
      },
    },
  });
  humidityChart = new Chart(graph2, {
    type: "line",
    data: {
      labels: time,
      datasets: [
        {
          label: "Humidity",
          data: humdt,
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: false,
        },
      },
      plugins: {
        title: {
          display: true,
          text: "Change in humidity",
          padding: {
            top: 10,
            bottom: 30,
          },
          font: {
            size: 20,
          },
        },
      },
    },
  });
}
