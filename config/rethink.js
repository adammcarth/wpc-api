// Configuration for RethinkDB (using Thinky as the ORM)
rethinkConfig = {
  host: process.env.RETHINK_HOST || "127.0.0.1",
  port: process.env.RETHINK_PORT || 28015,
  db: process.env.RETHINK_DB || "wpc_development",
  user: process.env.RETHINK_USER,
  authKey: process.env.RETHINK_AUTHKEY
};

// Different database name for testing environment
if ( process.env.NODE_ENV === "testing" ) {
  rethinkConfig.db = process.env.RETHINK_DB || "wpc_testing";
}

let thinky = require("thinky")(rethinkConfig);

module.exports = thinky;
