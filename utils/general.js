module.exports = {
  // get the current URL of the page
  currentUrl: (req) => {
    return req.protocol + "://" + req.get("host") + req.originalUrl.split("?")[0];
  },

  // get the current URL of the page (with the query string, if it exists)
  currentUrlWithQs: (req) => {
    return req.protocol + "://" + req.get("host") + req.originalUrl;
  },

  // replaces a string, object or array with variables (written as `${varName}`)
  addVars: (input, varList) => {
    if ( input && varList ) {
      if ( typeof input === "string" ) {
    		Object.keys(varList).forEach((varName) => {
    			input = input.split("${" + varName + "}").join(varList[varName]);
    		});

        return input;
    	} else if ( typeof input === "object" && Object.keys(input).length > 0 ) {
    		stringified = JSON.stringify(input);

    		Object.keys(varList).forEach((varName) => {
    			stringified = stringified.split("${" + varName + "}").join(varList[varName]);
    		});

    		return JSON.parse(stringified);
    	} else {
        return input;
      }
    }
  },

  // can a route be accessed by someone with a certain authentication method?
  // config for this is defined in /config/routes.js
  routePermissions: (type, req) => {
    routeConfig = req.app.get("routeConfig");
    permissions = routeConfig.permissions[type];
    method = req.method;
    path = req.originalUrl.split("?")[0];
    whitelisted = false;

    // If no rules are defined, everything can be accessed by default
    if ( Object.keys(permissions).length === 0 ) {
      return true;
    } else {
      Object.keys(permissions).forEach((rule) => {
        if ( rule === "*" || new RegExp("^" + rule.split("*").join(".*") + "$").test(method) ) {
          if ( new RegExp("^" + permissions[rule].split("*").join(".*") + "$").test(path) ) {
            whitelisted = true;
            return;
          }
        }
      });

      return whitelisted;
    }
  }
}
