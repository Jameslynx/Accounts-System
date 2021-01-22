require("dotenv/config");
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const mongoose = require("mongoose");
const morgan = require("morgan");
const flash = require("connect-flash");
const session = require("express-session");
const passport = require("passport");
const cors = require("cors");

let mongo_uri = process.env.MONGO_URI;
// Connect to MongoDB
if (process.env.NODE_ENV === "test") {
  mongo_uri = process.env.TSTDB_URI;
}

// instruct mongoose to emit 'ready' when it's finished connecting
mongoose.connection.once("open", function () {
  // All OK - fire (emit) a ready event.
  console.log("Connected to MongoDB");
  app.emit("ready");
});

mongoose.connect(
  mongo_uri,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  },
  (err) => {
    if (err) throw err;
  }
);

// express Config
const app = express();

//don't show the log when it is test
if (process.env.NODE_ENV !== "test") {
  //use morgan to log at command line
  app.use(morgan("combined")); //'combined' outputs the Apache style LOGs
}

// cors
app.use(cors());

// EJS
app.use(expressLayouts);
app.set("view engine", "ejs");
app.use("/public", express.static(__dirname + "/public"));

// Bodyparser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Express Session
app.use(
  session({
    secret: "some#fothersuckers*always@try!to$skate%uphill",
    resave: true,
    saveUninitialized: true,
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());
require("./config/passport")(passport);

// Connect flash
app.use(flash());

// Global vars
app.locals.scripts = [];
app.locals.addScripts = function (all) {
  app.locals.scripts = [];
  if (all != undefined) {
    app.locals.scripts = all
      .map(function (script) {
        return '<script src="/public/js/' + script + '"></script>';
      })
      .join("\n ");
  } else {
    return "";
  }
};
app.locals.getScripts = function (req, res) {
  return app.locals.scripts;
};

app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

// Routes
app.use("/", require("./routes/index"));
app.use("/users", require("./routes/users"));
app.use("/users/verification", require("./routes/verification"));
app.use("/users/password", require("./routes/passReset"));

module.exports = app; // for testing

const PORT = process.env.PORT;
app.on("ready", function () {
  app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}...`);
    app.emit("appStarted");
  });
});
