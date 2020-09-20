require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 5000;
const Twit = require("twit");
const fetch = require("node-fetch");
const weatherAPI = process.env.WEATHER_API_KEY;
const dayjs = require("dayjs");
const localizedFormat = require("dayjs/plugin/localizedFormat");
dayjs.extend(localizedFormat);

// lsiten to GET requests from uptimerobot.com to keep the bot running 24/7.
app.get("/", (req, res) => {
  res.send("Bot is running...");
});

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

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

const beiURL = `https://api.openweathermap.org/data/2.5/onecall?${beirut[0]}&exclude=minutely,hourly&units=metric&appid=${weatherAPI}`;
const sidURL = `https://api.openweathermap.org/data/2.5/onecall?${saida[0]}&exclude=minutely,hourly&units=metric&appid=${weatherAPI}`;
const triURL = `https://api.openweathermap.org/data/2.5/onecall?${tripoli[0]}&exclude=minutely,hourly&units=metric&appid=${weatherAPI}`;
const zahURL = `https://api.openweathermap.org/data/2.5/onecall?${zahle[0]}&exclude=minutely,hourly&units=metric&appid=${weatherAPI}`;

setInterval(() => {
  //! date block
  var date = dayjs();
  var now = date.add("3", "hour");
  const currentTime = dayjs(now).format("LTS"); //current time in 12 hour fomrat
  var today = dayjs().format("dddd, MMM D, YYYY"); // current Date
  //console.log(currentTime, today);

  //! two random numbers
  const random = Math.floor(Math.random() * 8); // random morning msg
  const num1 = Math.floor(Math.random() * 10); // 2 random numbers
  var num2 = Math.floor(Math.random() * 10);
  while (num2 === num1) {
    num2 = Math.floor(Math.random() * 10);
  }
  const city1 = randomCities[num1]; // first random city
  const city2 = randomCities[num2]; // 2nd random city

  const tweetCities = [beirut, saida, tripoli, zahle, city1, city2];

  const randomURL1 = `https://api.openweathermap.org/data/2.5/onecall?${city1[0]}&exclude=minutely,hourly&units=metric&appid=${weatherAPI}`;
  const randomURL2 = `https://api.openweathermap.org/data/2.5/onecall?${city2[0]}&exclude=minutely,hourly&units=metric&appid=${weatherAPI}`;

  if (currentTime === "3:31:44 AM" || currentTime === "3:31:45 AM") {
    Promise.all([
      fetch(beiURL).then((res) => res.json()),
      fetch(sidURL).then((res) => res.json()),
      fetch(triURL).then((res) => res.json()),
      fetch(zahURL).then((res) => res.json()),
      fetch(randomURL1).then((res) => res.json()),
      fetch(randomURL2).then((res) => res.json()),
    ])
      .then((body) => {
        const text = tweetCities.map((city, index) => {
          const cityName = city[1];
          const cityHigh = Math.round(body[index].daily[0].temp.max);
          const cityLow = Math.round(body[index].daily[0].temp.min);
          const cityStatus = body[index].daily[0].weather[0].main;
          const cityDescription = body[index].daily[0].weather[0].description;
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
        //Tweet
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
      .catch((err) => {
        console.log(err);
      });
  } else {
    return;
  }
}, 2000);
