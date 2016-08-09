// Load dependancies and main application
let path = require("path"),
    fs = require("fs"),
    app = require(path.join(__dirname, "app.js")),
    thinky = require(path.join(__dirname, "config/rethink.js")),
    bodyParser = require("body-parser"),
    logger = require("morgan"),
    morgan = require("morgan"),
    winston = require("winston"),
    expressWinston = require("express-winston"),
    uuid = require("node-uuid");

// Pretty format JSON in development mode
if ( app.get("env") === "development" ) {
  app.set("json spaces", 2);
}

// Allow POST parameters to be read in routes
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// All API responses should have JSON content type
// Also allow requests from any domain name to interface the API
app.use((req, res, next) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

// Assign ID to each request
app.use((req, res, next) => {
  req.id = uuid.v4();
  console.log(req.originalUrl.split("?")[0]);
  next();
});

// Logging!
// Also - never log sensitive stuff in production
if ( app.get("env") === "production" ) {
  logFileFlags = { flags: "a" };
  bodyBlackList = ["password", "pass", "pin", "pwd", "passwd", "email", "address"]
} else {
  logFileFlags = { flags: "w" };
  bodyBlackList = undefined;
}

// Write Error.log to disk (Access.log code in ./app.js)
app.use(expressWinston.errorLogger({
  transports: [
    new winston.transports.File({
      level: "warn",
      statusLevels: true,
      json: true,
      stream: fs.createWriteStream(path.join(__dirname, "logs/error.log"), logFileFlags)
    })
  ],
  requestWhitelist: ["body"],
  responseWhitelist: ["body"],
  bodyBlackList: bodyBlackList,
  meta: true,
  msg: "[{{res.statusCode}}] {{req.method}} {{req.url}}",
  expressFormat: true
}));

// Establish connection to database + ensure tables & indexes are present
// ...then start the API!
thinky.dbReady().then(() => {
  startExpress();
}).error(() => {
  console.log("\n\n\n\nError: Couldn't connect to RethinkDB database. Have you started RethinkDB in another shell window yet?\n-----\n\n");
  process.exit(1);
});

// Start the server!
function startExpress() {
  this.server = app.listen(process.env.PORT || 3000);
  console.log("\nWPC API is now running on port " + (process.env.PORT || 3000) + "...\n\n");
}
