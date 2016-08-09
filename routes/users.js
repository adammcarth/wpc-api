module.exports = (app, utils) => {
  let path = require("path"),
      User = app.get("models").User,
      r = require(path.join(__dirname, "../config/rethink.js")).r,
      jwt = require("jsonwebtoken"),
      bcrypt = require("bcrypt");

  // [GET] ALL RECORDS
  app.get("/users", (req, res) => {
    utils.paginate(User.orderBy({index: "createdAt"}).getJoin({
      apiKeys: true
    }), req, res, 50);
  });

  // [GET] SPECIFIC RECORD
  app.get("/users/:id", (req, res) => {
    User.get(req.params.id)
    .without("password")
    .getJoin({
      apiKeys: true
    }).execute().then((user) => {
      res.json(user);
    }).error(utils.handleError(res));
  });

  // [POST] NEW RECORD
  app.post("/users", (req, res) => {
    req.body.hasNewPassword = true;

    User.save(req.body).then((resource) => {
      resource.password = undefined; // no need to show encrypted password
      res.status(201).json(resource);
    }).error(utils.handleError(res));
  });

  // [PATCH] NEW UPDATE
  app.patch("/users/:id", (req, res) => {
    User.get(req.params.id).run().then((user) => {
      user.merge(req.body).save().then((result) => {
        res.status(204).send("");
      }).error(utils.handleError(res));
    }).error(utils.handleError(res));
  });

  // [DELETE] RECORD
  app.delete("/users/:id", (req, res) => {
    User.get(req.params.id).run().then((user) => {
      user.delete().then((result) => {
        res.status(204).send("");
      }).error(utils.handleError(res));
    }).error(utils.handleError(res));
  });

  // TOKENS / LOGIN STUFF
  // [POST] Login and request new token
  app.post("/authenticate", (req, res) => {
    if ( !req.body.email || !req.body.password ) {
      res.status(401).json({error: "Please enter an email and password."});
      return;
    }

    User.getAll(req.body.email, {index: "email"}).limit(1).run().then((results) => {
      // if there was no user with that email
      if ( !results[0] ) {
        res.status(401).json({"error": "No user found with that email."});
      } else {
        user = results[0];
        // try to decrypt the password with the one specified
        bcrypt.compare(req.body.password, user.password, (err, correct) => {
          if (err) res.status(500).send({error: "Unexpected error encountered while decrypting password."});

          if ( correct ) {
            // generate a new token and send it as the response
            let token = jwt.sign(user, app.get("secret"), {
              expiresIn: "24 hours"
            });

            res.json({"token": token});
          } else {
            res.status(401).json({"error": "Incorrect password."});
          }
        });
      }
    }).error(utils.handleError(res));
  });
}
