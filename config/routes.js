module.exports = {
  // List of routes that can be accessed based of the authentication type being
  // used. This can be either an API Key or a user with their auth token.
  // Having nothing in these categories will make all routes available by default.
  // You can use wildcards, eg - "*": "/posts*"
  "permissions": {
    "public": {
      "POST": "/authenticate"
    },

    "api": {
      "GET": "/"
    },

    "user": {
      // You can do everything, man.
    }
  }
}
