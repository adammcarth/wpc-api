// Load dependancies
let app = require("express")(),
    path = require("path"),
    fs = require("fs"),
    glob = require("glob"),
    cors = require("cors"),
    jwt = require("jsonwebtoken"),
    basicAuth = require("basic-auth"),
    routeConfig = require(path.join(__dirname, "config/routes.js")),
    morgan = require("morgan"),
    winston = require("winston"),
    expressWinston = require("express-winston"),
    utils = {};

// Set config globally
app.set("routeConfig", routeConfig);

// Import the models for RethinkDB
models = {};
glob(path.join(__dirname, "models/**/*.js"), (err, files) => {
  if (err) throw err;
  files.forEach((filename) => {
    // Take each filename and give it a capital first letter
    f = filename.split("/")[filename.split("/").length - 1];
    modelName = f.charAt(0).toUpperCase() + f.substring(1, f.length - 3);
    models[modelName] = require(filename);
  });
});
app.set("models", models);

// Warn if not using a manual secret
if ( app.get("env") === "production" && !process.env.SECRET ) {
  console.log("Warning: Secret key has not been properly set. Please use the `SECRET` environment variable if this is a real production environment.");
}

// Authenticate requests in non-development environments
app.set("secret", process.env.SECRET || "LkkRlKrBof6pIBYljqSDv45Izj0RRlymtsyazFlm");
if ( app.get("env") != "development" ) {
  app.use((req, res, next) => {
    if ( req.app.get("utils").routePermissions("public", req) ) {
      // Skip auth checking if this is a public route
      next();
    } else {
      let token = req.headers["x-access-token"],
          apiKey = req.headers["x-api-key"];
      // API Key fallback to HTTP Basic Auth if it has been used
      if ( !apiKey && basicAuth(req) ) {
        apiKey = basicAuth(req).name;
      }

      if ( token ) {
        // Verify a users json web token
        jwt.verify(token, app.get("secret"), (err, userObj) => {
          if ( err ) {
            res.status(401).json({"error": "Auth Token is not valid."});
          } else {
            userObj["password"] = undefined; // no need for exposing password field
            req.currentUser = userObj;
            res.set("currentUser", JSON.stringify(userObj));

            // Finally - make sure this request has permission to run
            if ( req.app.get("utils").routePermissions("user", req) ) {
              next();
            } else {
              res.status(403).json({"error": "Permission denied."});
            }
          }
        });
      } else if ( apiKey ) {
        // Verify an API key
        let Key = app.get("models").Key;
        Key.get(apiKey).run().then((results) => {
          // Now - make sure this request has permission to run
          if ( req.app.get("utils").routePermissions("api", req) ) {
            next();
          } else {
            res.status(403).json({"error": "Permission denied."});
          }
        }).error(app.get("utils").handleError(res, 401, "Invalid API key."));
      } else {
        // No token or API key was provided, so return a 401 unauthorized.
        res.status(401).json({"error": "Authentication is required."});
      }
    }
  });
}

// Logging
// Log each request to STDOUT when in development
if ( app.get("env") === "development" ) {
  app.use(morgan("dev"));
}

// Log errors only to STDOUT when in testing
if ( app.get("env") === "testing" ) {
  app.use(morgan("combined", {
    skip: (req, res) => {
      return res.statusCode > 199 && res.statusCode < 400;
    }
  }));
}

// Overwrite log files each time unless in production (in which case append)
// Also - never log sensitive stuff in production
if ( app.get("env") === "production" ) {
  logFileFlags = { flags: "a" };
  bodyBlackList = ["password", "pass", "pin", "pwd", "passwd", "email", "address"]
} else {
  logFileFlags = { flags: "w" };
  bodyBlackList = undefined;
}

// Write Access.log to disk (Error.log code in ./server.js)
app.use(expressWinston.logger({
  transports: [
    new winston.transports.File({
      level: "info",
      json: true,
      stream: fs.createWriteStream(path.join(__dirname, "logs/access.log"), logFileFlags),
      handleExceptions: false
    })
  ],
  responseBlacklist: ["body"],
  requestWhitelist: ["body"],
  bodyBlackList: bodyBlackList,
  meta: true,
  msg: "[{{res.statusCode}}] {{req.method}} {{req.url}} ({{req.id}})",
  expressFormat: true
}));

// Import utility helper functions
glob(path.join(__dirname, "utils/**/*.js"), (err, files) => {
  if (err) throw err;
  files.forEach((filename) => {
    Object.assign(utils, require(filename));
  });
  app.set("utils", utils);

  // Import API routes
  glob(path.join(__dirname, "routes/**/*.js"), (err, files) => {
    if (err) throw err;
    files.forEach((filename) => {
      require(filename)(app, utils);
    });
  });
});

// Export the application for server.js
module.exports = app;
