let frisby = require("frisby"),
    apiKey = "696f2703d704f27aba1ea59cd7659a49";

// Tests for the User resource
describe("USERS", () => {

  frisby.create("Get a list of all users")
    .get("http://localhost:3000/users")
    .addHeader("X-API-Key", apiKey)
    .expectStatus(200)
    .expectHeaderContains("Content-Type", "application/json")
  .toss();

  frisby.create("Creating a user with no parameters should fail")
    .post("http://localhost:3000/users")
    .addHeader("X-API-Key", apiKey)
    .expectStatus(422)
    .expectHeaderContains("Content-Type", "application/json")
  .toss();

  frisby.create("Creating a user with no email should fail")
    .post("http://localhost:3000/users", {
      password: "password"
    })
    .addHeader("X-API-Key", apiKey)
    .expectStatus(422)
    .expectHeaderContains("Content-Type", "application/json")
  .toss();

  frisby.create("Creating a user with an invalid email should fail")
    .post("http://localhost:3000/users", {
      email: "blahhhh"
    })
    .addHeader("X-API-Key", apiKey)
    .expectStatus(422)
    .expectHeaderContains("Content-Type", "application/json")
  .toss();

  frisby.create("Creating a user with no password should fail")
    .post("http://localhost:3000/users", {
      email: "john@test.com"
    })
    .addHeader("X-API-Key", apiKey)
    .expectStatus(422)
    .expectHeaderContains("Content-Type", "application/json")
  .toss();

  frisby.create("Create a user which name is too large (> 40)")
    .post("http://localhost:3000/users", {
      password: "password",
      email: "john@blah.com",
      name: "The name for this user is going to be way longer than 40 characters in length man!"
    }, {json: true})
    .addHeader("X-API-Key", apiKey)
    .expectStatus(422)
    .expectHeaderContains("Content-Type", "application/json")
  .toss();

  frisby.create("Create a user which email is too large (> 50)")
    .post("http://localhost:3000/users", {
      password: "password",
      email: "ssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss"
    }, {json: true})
    .addHeader("X-API-Key", apiKey)
    .expectStatus(422)
    .expectHeaderContains("Content-Type", "application/json")
  .toss();

  frisby.create("Create a user which password is too small (< 5)")
    .post("http://localhost:3000/users", {
      password: "n",
      email: "blah@blah.com"
    }, {json: true})
    .addHeader("X-API-Key", apiKey)
    .expectStatus(422)
    .expectHeaderContains("Content-Type", "application/json")
  .toss();

  frisby.create("Create a new user")
    .post("http://localhost:3000/users", {
      id: "foobar",
      email: "myemail@domain.com",
      password: "password",
      irrelevant_parameter: "Delete me"
    }, {json: true})
    .addHeader("X-API-Key", apiKey)
    .expectStatus(201)
    .expectHeaderContains("Content-Type", "application/json")
    .expectJSON({
      id: "foobar",
      email: "myemail@domain.com",
      irrelevant_parameter: undefined
    })
  .toss();

  frisby.create("Get a specific user")
    .get("http://localhost:3000/users/1")
    .addHeader("X-API-Key", apiKey)
    .expectStatus(200)
    .expectHeaderContains("Content-Type", "application/json")
    .expectJSON({
      id: "1",
      email: "john@test.com"
    })
    .expectJSONTypes({
      id: String,
      email: String,
      level: Number,
      apiKeys: Array,
      createdAt: Date,
      updatedAt: Date
    })
  .toss();

  frisby.create("Update a user")
    .patch("http://localhost:3000/users/2", {
      level: 2
    }, {json: true})
    .addHeader("X-API-Key", apiKey)
    .expectStatus(204)
    .after(() => {
      frisby.create("Check that user updates in database")
        .get("http://localhost:3000/users/2")
        .addHeader("X-API-Key", apiKey)
        .expectJSON({
          level: 2
        })
      .toss();
    })
  .toss();

  frisby.create("Delete a user")
    .delete("http://localhost:3000/users/3")
    .addHeader("X-API-Key", apiKey)
    .expectStatus(204)
    .after(() => {
      frisby.create("Check that user deletes in database")
        .get("http://localhost:3000/users/3")
        .addHeader("X-API-Key", apiKey)
        .expectStatus(404)
      .toss();
    })
  .toss();

  frisby.create("Login with an email not in the database")
    .post("http://localhost:3000/authenticate", {
      email: "bbq@gmail.com",
      password: "hooligan"
    }, {json: true})
    .addHeader("X-API-Key", apiKey)
    .expectStatus(401)
    .expectHeaderContains("Content-Type", "application/json")
  .toss();

  frisby.create("Login with an invalid password")
    .post("http://localhost:3000/authenticate", {
      email: "john@test.com",
      password: "hooligan"
    }, {json: true})
    .addHeader("X-API-Key", apiKey)
    .expectStatus(401)
    .expectHeaderContains("Content-Type", "application/json")
  .toss();

  frisby.create("Logging in with valid credentials should recieve auth token")
    .post("http://localhost:3000/authenticate", {
      email: "john@test.com",
      password: "password"
    }, {json: true})
    .addHeader("X-API-Key", apiKey)
    .expectStatus(200)
    .expectHeaderContains("Content-Type", "application/json")
  .toss();

});
