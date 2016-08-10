// Model: Score
// Description: Collects the latest win count from Sam & Adam's pool games. Also
// contains info about the latest game.

let path = require("path"),
    thinky = require(path.join(__dirname, "../config/rethink.js")),
    type = thinky.type,
    r = thinky.r;

let Score = thinky.createModel("Score", {
  id: type.string(), // PK
  sam: type.object().required().schema({
    wins: type.number().required().min(0).max(100)
  }),
  adam: type.object().required().schema({
    wins: type.number().required().min(0).max(100)
  }),
  text: type.string().max(130),
  link: type.string().max(130),
  createdAt: type.date().default(r.now()),
  updatedAt: type.date().default(r.now())
}, {
  enforce_extra: "remove"
});

Score.ensureIndex("createdAt");
Score.ensureIndex("updatedAt");

module.exports = Score;

// Punch the timestamp for `updatedAt` on each save
Score.pre("save", function(next) { this.updatedAt = r.now(); next(); });
