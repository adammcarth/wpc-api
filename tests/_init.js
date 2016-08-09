// Import the express app + thinky database models
let path = require("path"),
    app = require(path.join(__dirname, "../app.js")),
    thinky = require(path.join(__dirname, "../config/rethink.js")),
    confirm = require("confirm-simple");

// Confirm removing all data from database in non-test environment
if ( process.env.NODE_ENV != "testing" ) {
  console.log("");
  confirm("Woah, hold up player. Running tests will completely erase your current database and insert new test data. Have you double checked that your app server is running in the `testing` environment?", ["yep", "cancel"], (allG) => {
    if ( allG ) {
      doTestData();
    } else {
      process.exit(-1);
    }
  });
} else {
  doTestData();
}

// Initialize database with test data
function doTestData() {

  thinky.dbReady().then(() => {
    let User = app.get("models").User,
        Key = app.get("models").Key,
        Score = app.get("models").Score,
        r = thinky.r;

    // 1. First, delete any old data from the test database
    console.log("Inserting test data...");
    r.table("Key").delete().run().then(() => {
      r.table("User").delete().run().then(() => {
        r.table("Score").delete().run().then(() => {
          insertTestData();
        }).error((e) => { throw e });
      }).error((e) => { throw e });
    }).error((e) => { throw e });

    // 2. Insert the test data when function is called
    function insertTestData() {
      // API Keys
      const keys = [
        {
          key: "696f2703d704f27aba1ea59cd7659a49",
          deviceSerialNumber: "45mv6laL4A04cMfQ"
        },

        {
          name: "Please regenerate me",
          key: "c20e0fe5e3b840541a61fd666329697f"
        },

        {
          key: "99825072d742b33550d68227fb3766a9"
        },

        {
          key: "b309200322506528992b8d10ff22cd33",
          userId: "1"
        }
      ];

      const users = [
        {
          id: "1",
          email: "john@test.com",
          password: "$2a$12$vc8zTx32WpYZBNeNFjhYaOCiiNQsUXsbbED7n2wr3JzyXmGuab1Ui", // "password"
        },

        {
          id: "2",
          email: "sally@test.com",
          password: "$2a$12$3FeDAibheJwrPfBuB9PhiO1qiNQuNUW2InqrewEe28KKpBUyloy1e" // "password"
        },

        {
          id: "3",
          email: "adam@test.com",
          password: "$2a$12$7MjrvcISXuMhcZ6/aeNXZeq9FigvD3kkmYBmf..kzlolAKBypiF/u" // "password"
        }
      ];

      const scores = [
        {
          id: "1",
          sam: {
            wins: 5
          },
          adam: {
            wins: 5
          },
          text: "Google",
          link: "http://google.com"
        }
      ];

      // Insert the data
      User.save(users).then(() => {
        Key.save(keys).then(() => {
          Score.save(scores).then(() => {
            console.log("Done.");
            process.exit(0);
          }).error((e) => { throw e });
        }).error((e) => { throw e });
      }).error((e) => { throw e });
    }

  }); // end thinky.dbReady

}
