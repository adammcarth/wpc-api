let frisby = require("frisby"),
    apiKey = "696f2703d704f27aba1ea59cd7659a49";

// Tests for the Score resource
describe("SCORES", () => {

  frisby.create("Get the latest scores")
    .get("http://localhost:3000")
    .addHeader("X-API-Key", apiKey)
    .expectStatus(200)
    .expectHeaderContains("Content-Type", "application/json")
    .expectJSONTypes({
      sam: Object,
      adam: Object
    })
    .expectJSONTypes("sam", {
      wins: Number
    })
    .expectJSONTypes("adam", {
      wins: Number
    })
  .toss();

  frisby.create("Create a new score set")
    .post("http://localhost:3000", {
      sam: {
        wins: 1
      },
      adam: {
        wins: 2
      },
      irrelevant_parameter: "Delete me"
    }, {json: true})
    .addHeader("X-API-Key", apiKey)
    .expectStatus(201)
    .expectHeaderContains("Content-Type", "application/json")
    .expectJSON({
      sam: {
        wins: 1
      },
      adam: {
        wins: 2
      },
      irrelevant_parameter: undefined
    })
  .toss();

});
