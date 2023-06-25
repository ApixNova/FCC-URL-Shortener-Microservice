require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();

const bodyParser = require("body-parser");
const mongoose = require("mongoose");
// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});

// Let's go!

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const urlSchema = new mongoose.Schema({
  url: String,
  short: Number,
});

let Url = mongoose.model("Url", urlSchema);

async function addUrl(url, lastNum) {
  const done = await Url.create({ url: url, short: lastNum + 1 });
}

app.use(bodyParser.urlencoded({ extended: false }));

app.post("/api/shorturl", function (req, res) {
  console.log("url: " + req.body.url);
  const url = req.body.url;

  let test = /https?:[/]{2}.+/.test(url);
  console.log(test);
  if (test == false) {
    res.json({ error: "invalid url" });
  } else {
    //get last one's number
    getLast();
    async function getLast() {
      // .sort('-short') to have a descending order
      try {
        const last = await Url.findOne().sort("-short");
        console.log(last.short);
        //create a new one with n+1
        addUrl(url, last.short);
        //display shortened url
        display(last.short + 1);
      } catch (e) {
        console.log(e.message);
      }
    }
    function display(short) {
      res.json({ original_url: url, short_url: short });
    }
  }
});

app.use("/api/shorturl/:url", function (req, res, next) {
  async function getAndRedirect() {
    try {
      const obj = await Url.findOne({ short: req.params.url });
      console.log(obj.url);
      redirect(obj.url);
    } catch (e) {
      console.log(e);
    }
  }
  getAndRedirect();
  function redirect(targetUrl) {
    res.redirect(targetUrl);
    next();
  }
});

exports.urlSchema = Url;
