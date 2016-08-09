module.exports = (app, utils) => {
  let path = require("path"),
      Key = app.get("models").Key,
      User = app.get("models").User,
      Device = app.get("models").Device,
      r = require(path.join(__dirname, "../config/rethink.js")).r;

  // [GET] ALL RECORDS
  app.get("/keys", (req, res) => {
    utils.paginate(Key.orderBy({index: r.desc("createdAt")}), req, res);
  });

  // [GET] SPECIFIC RECORD
  app.get("/keys/:key", (req, res) => {
    Key.get(req.params.key)
    .getJoin({
      user: true
    }).run().then((key) => {
      res.json(key);
    }).error(utils.handleError(res));
  });

  // [POST] NEW RECORD
  app.post("/keys", (req, res) => {
    Key.save(req.body).then((resource) => {
      res.status(201).json(resource);
    }).error(utils.handleError(res));
  });

  // [POST] REGENERATE KEY
  app.post("/keys/:key/regenerate", (req, res) => {
    Key.get(req.params.key).run().then((key) => {
      let hat = require("hat").rack();
      key.merge({key: hat()}).save().then((result) => {
        res.status(200).send(result);
      }).error(utils.handleError(res));
    }).error(utils.handleError(res));
  });

  // [PATCH] NEW UPDATE
  app.patch("/keys/:key", (req, res) => {
    Key.get(req.params.key).run().then((key) => {
      key.merge(req.body).save().then((result) => {
        res.status(204).send("");
      }).error(utils.handleError(res));
    }).error(utils.handleError(res));
  });

  // [DELETE] RECORD
  app.delete("/keys/:key", (req, res) => {
    Key.get(req.params.key).run().then((key) => {
      key.delete().then((result) => {
        res.status(204).send("");
      }).error(utils.handleError(res));
    }).error(utils.handleError(res));
  });
}
