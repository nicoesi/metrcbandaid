// Dependencies
var express = require("express");
var mongojs = require("mongojs");
var logger = require("morgan");
var path = require("path");
var axios = require("axios");
require('dotenv').config();

var app = express();

var PORT = process.env.PORT || 3000;

// Set the app up with morgan.
// morgan is used to log our HTTP Requests. By setting morgan to 'dev'
// the :status token will be colored red for server error codes,
// yellow for client error codes, cyan for redirection codes,
// and uncolored for all other codes.
app.use(logger("dev"));

// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

const credentials = process.env.CREDENTIALS;

// Database configuration
var databaseUrl = "orderdata";
var collections = ["orders"];

// Hook mongojs config to db variable for dev
// var db = mongojs(databaseUrl, collections);

//for heroku uncoment below
var db = mongojs(process.env.MONGODB_URI) || mongojs(databaseUrl, collections);

// Log any mongojs errors to console
db.on("error", function(error) {
  console.log("Database Error:", error);
});

// Routes
// ======

// Simple index route
app.get("/", function(req, res) {
  res.sendFile(path.join(__dirname + "./public/index.html"));
});

app.get("/orders/:tenant", function(req, res) {
  // Find all notes in the notes collection
  let tenant = req.params.tenant;

  axios
    .get("https://api.commerce7.com/v1/order", {
      headers: {
        Authorization: credentials,
        tenant: tenant
      }
    })
    .then(function(response) {
      res.send(response.data.orders);
    })
    .catch(function(error) {
      console.log(error);
    });
});

app.get("/order/:tenant/:order", function(req, res) {
  // Find all notes in the notes collection
  let tenant = req.params.tenant;
  let order = req.params.order

  axios
    .get(`https://api.commerce7.com/v1/order/${order}`, {
      headers: {
        Authorization: credentials,
        tenant: tenant
      }
    })
    .then(function(response) {
      res.send(response.data)
    })
    .catch(function(error) {
      console.log(error);
    });
});

app.post("/save", function(req, res) {
  console.log(req.body);
  // Insert the note into the notes collection
  db.orders.insert(req.body, function(error, saved) {
    // Log any errors
    if (error) {
      console.log(error);
    } else {
      // Otherwise, send the note back to the browser
      // This will fire off the success function of the ajax request
      res.send(saved);
    }
  });
});

// Simple index route
app.get("/allorders", function(req, res) {
  // Find all notes in the notes collection
  db.orders.find({}, function(error, found) {
    // Log any errors
    if (error) {
      console.log(error);
    } else {
      // Otherwise, send json of the notes back to user
      // This will fire off the success function of the ajax request
      console.log(found)
      res.json(found);
    }
  });
});

// app.get("/pandora", function(req, res) {
//   res.sendFile(path.join(__dirname + "/public/editmenu-protected.html"));
// });

// app.get("/edit", function(req, res) {
//   res.sendFile(path.join(__dirname + "/public/edit.html"));
// });

// // Handle form submission, save submission to mongo
// app.post("/submit", function(req, res) {
//   console.log(req.body);
//   // Insert the note into the notes collection
//   db.soups.insert(req.body, function(error, saved) {
//     // Log any errors
//     if (error) {
//       console.log(error);
//     } else {
//       // Otherwise, send the note back to the browser
//       // This will fire off the success function of the ajax request
//       res.send(saved);
//     }
//   });
// });

// // Update just one note by an id
// app.post("/update/:id", function(req, res) {
//   // When searching by an id, the id needs to be passed in
//   // as (mongojs.ObjectId(IdYouWantToFind))

//   // Update the note that matches the object id
//   db.notes.update(
//     {
//       _id: mongojs.ObjectId(req.params.id)
//     },
//     {
//       // Set the title, note and modified parameters
//       // sent in the req body.
//       $set: {
//         title: req.body.title,
//         note: req.body.note,
//         modified: Date.now()
//       }
//     },
//     function(error, edited) {
//       // Log any errors from mongojs
//       if (error) {
//         console.log(error);
//         res.send(error);
//       } else {
//         // Otherwise, send the mongojs response to the browser
//         // This will fire off the success function of the ajax request
//         console.log(edited);
//         res.send(edited);
//       }
//     }
//   );
// });

// // Delete One from the DB
// app.get("/delete/:id", function(req, res) {
//   // Remove a note using the objectID
//   db.soups.remove(
//     {
//       _id: mongojs.ObjectID(req.params.id)
//     },
//     function(error, removed) {
//       // Log any errors from mongojs
//       if (error) {
//         console.log(error);
//         res.send(error);
//       } else {
//         // Otherwise, send the mongojs response to the browser
//         // This will fire off the success function of the ajax request
//         console.log(removed);
//         res.send(removed);
//       }
//     }
//   );
// });

// // Clear the DB
// app.get("/clearall", function(req, res) {
//   // Remove every note from the notes collection
//   db.soups.remove({}, function(error, response) {
//     // Log any errors to the console
//     if (error) {
//       console.log(error);
//       res.send(error);
//     } else {
//       // Otherwise, send the mongojs response to the browser
//       // This will fire off the success function of the ajax request
//       console.log(response);
//       res.send(response);
//     }
//   });
// });

// Listen on port 3000
app.listen(PORT, function() {
  console.log("App running on port 3000!");
});
