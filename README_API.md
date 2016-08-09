# API Documentation

### Scores

This model manages the latest pool scores for Sam & Adam.

- `sam` *[Object]*
  - `wins` *[Number] [Required] [Min: 0] [Max: 100]* Number of wins for Sam
- `adam` *[Object]*
  - `wins` *[Number] [Required] [Min: 0] [Max: 100]* Number of wins for Adam
- `text` *[String] [Max: 130]* Text for the "Live" section
- `link` *[String] [Max: 130]* URL for the "Live" section

### Users

This model stores Admin user accounts, which are used for access management to
the API. Note that passwords which are sent in plain text will be encrypted
automatically with [bcrypt](https://www.npmjs.com/package/bcrypt).

- `email`: *[String] [Required]* Email address used to login
- `password`: *[String] [Required]* Automatically encrypted on save/update
- `name`: *[String]* Username or real name can be added (optional)
- `level`: *[Number] [Default: 0]* Can be used for permissions/access control

```
GET /users
=> Retrieve a list of all users in the system.

GET /users/:id
=> Retrieve a specific user with their id.

POST /users
=> Create a new user.

PATCH /users/:id
=> Update a user's information.

DELETE /users/:id
=> Destroy a user.
```

API requests can be authenticated by using a
[JSON web token](https://www.npmjs.com/package/jsonwebtoken). Generated tokens will
be valid for 24 hours. Tokens are sent in the `X-Access-Token` http header.

```
POST /authenticate
=> Send "email" and "password" as body parameters to generate a token.
```
