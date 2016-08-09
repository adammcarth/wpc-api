let frisby = require("frisby"),
    apiKey = "696f2703d704f27aba1ea59cd7659a49";

// Tests for the Key resource
describe("KEYS", () => {
  frisby.create("Get a list of all keys")
    .get("http://localhost:3000/keys")
    .addHeader("X-API-Key", apiKey)
    .expectStatus(200)
    .expectHeaderContains("Content-Type", "application/json")
  .toss();

  frisby.create("Creating a key with a name which is too long (> 30) shoud fail")
    .post("http://localhost:3000/keys", {
      name: "This name for my API key is way too long and should definitely prevent it from being saved."
    })
    .addHeader("X-API-Key", apiKey)
    .expectStatus(422)
    .expectHeaderContains("Content-Type", "application/json")
  .toss();

  if ( process.env.NODE_ENV === "testing" || process.env.NODE_ENV === "production" ) {
    frisby.create("Check that providing no API key is 401 unauthorized")
      .get("http://localhost:3000/keys")
      .expectStatus(401)
      .expectHeaderContains("Content-Type", "application/json")
    .toss();

    frisby.create("Check that providing a false API key is 401 unauthorized")
      .get("http://localhost:3000/keys")
      .addHeader("X-API-Key", "invalid")
      .expectStatus(401)
      .expectHeaderContains("Content-Type", "application/json")
    .toss();
  }

  frisby.create("Create a new key")
    .post("http://localhost:3000/keys", {
      name: "My Demo API Key",
      irrelevant_parameter: "Delete me"
    }, {json: true})
    .addHeader("X-API-Key", apiKey)
    .expectStatus(201)
    .expectHeaderContains("Content-Type", "application/json")
    .expectJSON({
      name: "My Demo API Key",
      irrelevant_parameter: undefined
    })
  .toss();

  frisby.create("Get a specific key")
    .get("http://localhost:3000/keys/696f2703d704f27aba1ea59cd7659a49")
    .addHeader("X-API-Key", apiKey)
    .expectStatus(200)
    .expectHeaderContains("Content-Type", "application/json")
    .expectJSON({
      key: "696f2703d704f27aba1ea59cd7659a49"
    })
    .expectJSONTypes({
      key: String,
      createdAt: Date,
      updatedAt: Date
    })
  .toss();

  frisby.create("Regenerate a key")
    .post("http://localhost:3000/keys/c20e0fe5e3b840541a61fd666329697f/regenerate")
    .addHeader("X-API-Key", apiKey)
    .expectStatus(200)
    .expectHeaderContains("Content-Type", "application/json")
    .expectJSON({
      key: (val) => { expect(val).toNotEqual("c20e0fe5e3b840541a61fd666329697f") }
    })
    .expectJSONTypes({
      key: String
    })
  .toss();

  frisby.create("Update a key")
    .patch("http://localhost:3000/keys/99825072d742b33550d68227fb3766a9", {
      name: "My Awesome Key"
    }, {json: true})
    .addHeader("X-API-Key", apiKey)
    .expectStatus(204)
    .after(() => {
      frisby.create("Check if key updated in database")
        .get("http://localhost:3000/keys/99825072d742b33550d68227fb3766a9")
        .addHeader("X-API-Key", apiKey)
        .expectJSON({
          name: "My Awesome Key"
        })
      .toss();
    })
  .toss();

  frisby.create("Delete a key")
    .delete("http://localhost:3000/keys/b309200322506528992b8d10ff22cd33")
    .addHeader("X-API-Key", apiKey)
    .expectStatus(204)
    .after(() => {
      frisby.create("Check if key deleted from database")
        .get("http://localhost:3000/keys/b309200322506528992b8d10ff22cd33")
        .addHeader("X-API-Key", apiKey)
        .expectStatus(404)
      .toss();
    })
  .toss();
});
