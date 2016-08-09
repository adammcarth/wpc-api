// Model: User
// Description: Used to manage user admin accounts in the system.

let path = require("path"),
    thinky = require(path.join(__dirname, "../config/rethink.js")),
    type = thinky.type,
    r = thinky.r,
    bcrypt = require("bcrypt");

let User = thinky.createModel("User", {
  id: type.string(), // PK
  email: type.string().required().email().max(50),
  password: type.string().required().min(5),
  hasNewPassword: type.boolean(),
  name: type.string().alphanum().max(40),
  level: type.number().default(0).min(0).max(5),
  createdAt: type.date().default(r.now()),
  updatedAt: type.date().default(r.now())
}, {
  enforce_extra: "remove"
});

User.ensureIndex("createdAt");
User.ensureIndex("updatedAt");
User.ensureIndex("email");

module.exports = User;

// Relations
let Keys = require(path.join(__dirname, "key.js"));
User.hasMany(Keys, "apiKeys", "id", "userId");

// Punch the timestamp for `updatedAt` on each save
User.pre("save", function(next) { this.updatedAt = r.now(); next(); });

// Encrypt password before saving
// Must use tradional function() { ... } due to `this` scoping issues
User.pre("save", function(next) {
  self = this;

  // Validate the user first (before changing password value)
  try {
    self.validate();
  }
  catch(err) {
    next(err);
  }

  // Encrypt the password
  if ( self.hasNewPassword ) {
    bcrypt.hash(self.password, 12, (err, hash) => {
      if (err) next(err);

      self.password = hash;
      self.hasNewPassword = undefined;
      next();
    });
  } else {
    next();
  }
});
