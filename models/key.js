// Model: Key
// Description: API keys for third parties to integrate their service with this
// application. Keys can belong to other resources, but this is not a requirement.

let path = require("path"),
    thinky = require(path.join(__dirname, "../config/rethink.js")),
    type = thinky.type,
    r = thinky.r,
    hat = require("hat").rack();

let Key = thinky.createModel("Key", {
  key: type.string(), // PK
  name: type.string().max(30),
  userId: type.string(), // FK
  createdAt: type.date().default(r.now()),
  updatedAt: type.date().default(r.now())
}, {
  pk: "key",
  enforce_extra: "remove"
});

Key.ensureIndex("createdAt");
Key.ensureIndex("updatedAt");

module.exports = Key;

let User = require(path.join(__dirname, "user.js"));
Key.belongsTo(User, "user", "userId", "id");

// Punch the timestamp for `updatedAt` on each save
Key.pre("save", function(next) { this.updatedAt = r.now(); next(); });

// Generate API key on save
// Must use tradional function() { ... } due to `this` scoping issues
Key.pre("save", function(next) {
  self = this;

  if (!self.key) {
    self.key = hat();
  }

  next();
});

// Check foreign keys
Key.pre("save", function(next) {
  self = this;

  if (self.userId) {
    User.get(this.userId).run().then(() => {
      next();
    }).error(next);
  } else {
    next();
  }
});
