const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");
const axios = require("axios");
const cheerio = require("cheerio");
const db = require("./models");
const PORT = 3000;
const app = express();

// Use morgan logger for logging requests
app.use(logger("dev"));

// Parse request body as JSON
app.use(express.urlencoded({
  extended: true
}));
app.use(express.json());
app.use(express.static("public")); // Make public a static folder

// Connect to mongoDB
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI);

// Tapping into our news feed
app.get("/scrape", (req, res) => {
  // Gets the news
  axios.get("http://techcrunch.com/europe/").then(function (response) {
    const $ = cheerio.load(response.data);

    $(".post-block").each(function (i, element) {
      // Save an empty result object
      const result = {};

      // Headline 
      result.headline = $(this).children("header", "h2").text();

      // Summary
      result.summary = $(this).children("div", "p").text();

      // Link
      result.url = $(this).children("header").children("h2").children("a").attr("href");

      db.Article.create(result)
        .then(function (dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(function (err) {
          // If an error occurred, log it
          console.log(err);
        });
    });

    // Send a message to the client.
    res.send("Scrape Finally");
  });
});

// Route for getting all Articles from the db
app.get("/articles", function (req, res) {
  // finds all Articles
  db.Article.find({})
    .then(function (dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

app.get("/articles/:id", function (req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db
  db.Article.findOne({
      _id: req.params.id
    })
    // display
    .populate("note")
    .then(function (dbArticle) {
      // what we do after
      res.json(dbArticle);
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function (req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note.create(req.body)
    .then(function (dbNote) {
      // If a Note is created successfully, find one Article with an `_id` equal to `req.params.id` & Update the Article
      return db.Article.findOneAndUpdate({
        _id: req.params.id
      }, {
        note: dbNote._id
      }, {
        new: true
      });
    })
    .then(function (dbArticle) {
      // If able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Start the server and console log it
app.listen(PORT, () => console.log(`App running on port ${PORT}!`));