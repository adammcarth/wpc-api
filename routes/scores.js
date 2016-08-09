module.exports = (app, utils) => {
  let path = require("path"),
      Score = app.get("models").Score,
      r = require(path.join(__dirname, "../config/rethink.js")).r;

  // [GET] Latest Scores
  app.get("/", (req, res) => {
    Score.orderBy({index: r.desc("createdAt")}).nth(0).default(null).run().then((latest) => {
      res.json(latest);
    }).error(utils.handleError(res));
  });

  // [POST] New Score
  app.post("/", (req, res) => {
    Score.save(req.body).then((resource) => {
      res.status(201).json(resource);
    }).error(utils.handleError(res));
  });
}
