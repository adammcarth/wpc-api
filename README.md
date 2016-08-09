# World Pool Championships API

This application is the API endpoint for Sam & Adam's pool scores, running on the
[Dashr](https://github.com/dashrlabs) widget platform for Google Chrome. It uses
standard ES6 syntax (see: [http://node.green](http://node.green) for full list of
support), and runs on Node, ExpressJS and RethinkDB.

### Local Setup

- Clone this repository.
- Install RethinkDB: `brew update && brew install rethinkdb`
- Use the latest stable Node version: `nvm use 6.2.1`
  - Tip: run `nvm ls-remote` to see a list of available Node versions.
- Install the Node dependancies: `npm install`
- Run the RethinkDB server in a new shell window (inside this root project directory), with: `rethinkdb`
- Start the app: `npm start`

Additionally, to tweak the default environment settings you can use the following
option environment variables ahead of the `npm start` command:

- `NODE_ENV`: Set the app environment (development|testing|production)
- `PORT`: Port number that the app runs on (default: 3000)
- `RETHINK_HOST`: Hostname of the RethinkDB server (default: 127.0.0.1)
- `RETHINK_PORT`: Port for the RethinkDB server (default: 28015)
- `RETHINK_RETHINKDB`: Database name to use (default: sensor_development)
- `RETHINK_USER`: User for the RethinkDB server (default: undefined)
- `RETHINK_AUTHKEY`: Authentication for RethinkDB (usually for secured/managed deployments) (default: undefined)

### Development

This is a standard ExpressJS app. Route files inside of the `/routes` directory
are automatically included, so creating a new set of routes is as simple as
adding to or creating a new route file.

RethinkDB, a realtime document JSON database (similar to MongoDB) is being used.
In order to query, this project also uses a fairly simple ORM called [Thinky](http://thinky.io).
It extends a default client for RethinkDB called [rethinkdbdash](https://github.com/neumino/rethinkdbdash)
which method's you can also use in tandem with Thinky.

Models are defined in the `/models` directory, and similarly to routes, model
files are included automatically. When models are required they get saved into
an object that lives inside of `app.get("models")` using their capitalized
filename as the object name. Eg - to require a model living in: `/models/device.js`:

```
let Device = app.get("models").Device;
```

...similarly, if the filename was `/models/omg.js`, the code would be:

```
let Omg = app.get("models").Omg;
```

You then have a standard Thinky model instance to work with.

### Development Methodologies

- Code should be commented where appropriate, but given the declarative nature of the ORM - often code in this app reads quite clearly and can be over commented.
- 2 spaces for tabs.
- Always use ES6 arrow functions `() => { ... }` instead of `function() { ... }`.
- Always use ES6 `let` (or `const` where appropriate) instead of `var` to define variables.
- Use camel case for file names and variables. Eg - `myCoolName`.

### Testing

Tests are written for Jasmine, using a lightweight framework called [Frisby](http://frisby.io).
They can be found in the `/tests` directory. To write a new test, add it to the
relevant spec file, or create a new file (which will be automatically run).

- Start RethinkDB: `rethinkdb`
- Start the Express app server: `NODE_ENV=testing npm start`
  - Ensure to use the correct environment, otherwise development data will be destroyed.
- In the root of the project, run `npm test` to run the tests.
  - This will populate a database called `sensor_testing` with test data.

### API Documentation

For a full list of routes/API documentation, see `/API.md`.
