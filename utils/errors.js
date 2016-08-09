module.exports = {
  // Sends error messages from routes to the client side response
  handleError: (res, optionalStatusCode, optionalMessage) => {
    return (error) => {
      output = {};

      if ( process.env.NODE_ENV != "production" ) {
        output.dev_error = error.message;
      }

      if ( error.name === "DocumentNotFoundError" ) {
        output.error = optionalMessage || "Couldn't find the requested resource.";
        res.status(optionalStatusCode || 404);
      } else if ( error.name === "ValidationError" ) {
        output.error = optionalMessage || error.message;
        res.status(optionalStatusCode || 422);
      } else {
        output.error = optionalMessage || "Internal server error.";
        res.status(optionalStatusCode || 500);
      }

      res.json(output);
    }
  }
}
