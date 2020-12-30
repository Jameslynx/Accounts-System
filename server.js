require("dotenv/config");
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const mongoose = require("mongoose");
const flash = require("connect-flash");
const session = require("express-session");
const passport = require("passport");
const cors = require("cors");

// Connect to MongoDB
mongoose.connect(
  process.env.MONGO_URI,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  },
  (err) => {
    if (err) throw err;
    console.log("database connected");
  }
);

// express Config
const app = express();

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

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}...`);
});
