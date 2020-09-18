require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 5000;
const Twit = require("twit");
const fetch = require("node-fetch");
const weatherAPI = process.env.WEATHER_API_KEY;

app.get("/", (req, res) => {
  res.send("Bot is running...");
});

const city = require("./citiies/cities");
const {
  beirut,
  saida,
  tripoli,
  sour,
  jezzine,
  jounieh,
  jbeil,
  baalbak,
  zahle,
  bcharre,
  matn,
  batroun,
  rashaya,
  zgharta,
} = city;

const URL = `https://api.openweathermap.org/data/2.5/weather?q=Sidon&units=metric&appid=${weatherAPI}`;
const fullURL = `https://api.openweathermap.org/data/2.5/onecall?lat=33.5631&lon=35.3689&exclude=minutely,hourly&units=metric&appid=${weatherAPI}`;
const dayjs = require("dayjs");
const localizedFormat = require("dayjs/plugin/localizedFormat");
dayjs.extend(localizedFormat);

var Twitter = new Twit({
  consumer_key: process.env.API_TWITTER_KEY,
  consumer_secret: process.env.API_TWITTER_SECRET,
  access_token: process.env.ACCESS_TWITTER_TOKEN,
  access_token_secret: process.env.ACCESS_TWITTER_TOKEN_SECRET,
});

const morningMessages = [
  "Good Morning!",
  "Sabahooo😄",
  "Sabah l kher!",
  "صباح الخير!",
  "Morning🐣",
  "Bonjour☕️",
  "صباحو!",
  "Rise and shine🌞",
];

const randomCities = [
  sour,
  jezzine,
  jounieh,
  matn,
  baalbak,
  batroun,
  bcharre,
  jbeil,
  rashaya,
  zgharta,
];

const groupURL = `https://api.openweathermap.org/data/2.5/group?id=${beirut},${saida},${tripoli},${zahle},${randomCities[2]},${randomCities[6]}&units=metric&appid=${weatherAPI}`;

// keep checking for time
setInterval(() => {
  //! date block
  var date = dayjs();
  var now = date.add("3", "hour");
  const currentTime = dayjs(now).format("LTS"); //current time in 12 hour fomrat
  var today = dayjs().format("dddd, MMM D, YYYY"); // current Date

  //! random numbers
  const random = Math.floor(Math.random() * 8); // random morning msg
  const num1 = Math.floor(Math.random() * 10); // 2 random numbers
  var num2 = Math.floor(Math.random() * 10);
  while (num2 === num1) {
    num2 = Math.floor(Math.random() * 10);
  }
  console.log(num1, num2);
  console.log(currentTime, today);
  const url = `https://api.openweathermap.org/data/2.5/group?id=${beirut},${saida},${tripoli},${zahle},${randomCities[num1]},${randomCities[num2]}&units=metric&appid=${weatherAPI}`;

  //cities that will be in the tweet
  const tweetCities = [
    beirut,
    saida,
    tripoli,
    zahle,
    randomCities[num1],
    randomCities[num2],
  ];
  if (currentTime === "8:30:14 AM" || currentTime === "8:30:15 AM") {
    fetch(url)
      .then((res) => res.json())
      .then((body) => {
        // code for everything inside tweet
        const text = tweetCities.map((city, index) => {
          var cityName = body.list[index].name;
          switch (cityName) {
            case "Tyre":
              cityName = "Sour";
              break;

            case "Sidon":
              cityName = "Saida";
              break;

            case "Jezzîne":
              cityName = "Jezzine";
              break;

            case "Byblos":
              cityName = "Jbeil";
              break;

            case "Baalbek":
              cityName = "Baalbak";
              break;

            case "Bcharré":
              cityName = "Bcharre";
              break;

            case "Jdaidet el Matn":
              cityName = "Matn";
              break;

            case "Batroûn":
              cityName = "Batroun";
              break;

            case "Râchaïya el Ouadi":
              cityName = "Rashaya";
              break;

            case "Zghartā":
              cityName = "Zgharta";
              break;
          }
          const cityHigh = Math.round(body.list[index].main.temp_max);
          const cityLow = Math.round(body.list[index].main.temp_min);
          const cityStatus = body.list[index].weather[0].main;
          const cityDescription = body.list[index].weather[0].description;
          var emoji;
          // check the status to set the emoji
          if (cityStatus === "Clear") {
            emoji = "☀️";
          } else if (cityStatus === "Drizzle" || cityStatus === "Rain") {
            emoji = "🌧";
          } else if (cityStatus === "Snow") {
            emoji = "🌨";
          } else if (cityStatus === "Thunderstorm") {
            emoji = "⛈";
          } else if (
            cityStatus === "Thunderstorm" &&
            (cityDescription === "light thunderstorm" ||
              cityDescription === "thunderstorm with light drizzle")
          ) {
            emoji = "🌩";
          } else if (
            cityStatus === "Clouds" &&
            (cityDescription === "few clouds" ||
              cityDescription === "scattered clouds")
          ) {
            emoji = "🌥";
          } else if (
            cityStatus === "Clouds" &&
            (cityDescription === "broken clouds" ||
              cityDescription === "overcast clouds")
          ) {
            emoji = "☁️";
          } else if (cityStatus === ("Mist" || "Smoke" || "Haze" || "Fog")) {
            emoji = "🌫";
          } else if (
            cityStatus === ("Dust" || "Sand" || "Squall" || "Tornado" || "Ash")
          ) {
            emoji = "💨";
          }

          const cityText =
            "- " +
            cityName +
            emoji +
            ": " +
            cityHigh +
            "°C" +
            "(high)" +
            " / " +
            cityLow +
            "°C" +
            "(low)";
          return cityText;
        });
        // console.log(text);
        Twitter.post("statuses/update", {
          status:
            morningMessages[random] +
            "\n" +
            today +
            " weather forecast:\n" +
            text[0] +
            "\n" +
            text[1] +
            "\n" +
            text[2] +
            "\n" +
            text[3] +
            "\n" +
            text[4] +
            "\n" +
            text[5],
        });
      })
      .catch((err) => console.log(err));
  } else {
    return;
  }
}, 2000);

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

/* fetch(groupURL)
  .then((res) => res.json())
  .then((body) => {
    // get sidon weather
    console.log(body.list[0]);
  })
  .catch((err) => console.log(err));*/
