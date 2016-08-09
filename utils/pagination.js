let qs = require("qs"),
    path = require("path"),
    handleError = require(path.join(__dirname, "./errors.js"))["handleError"],
    r = require(path.join(__dirname, "../config/rethink.js")).r,
    generalUtils = require(path.join(__dirname, "./general.js"));

module.exports = {
  // Pagination helper which sends only the required records to the response
  // Also sets headers if a next/prev page is available + amount of total pages
  paginate: (query, req, res, perPage, mergeWith, nested) => {
    // 1. CONFIG:
    // Do we have all required parameters?
    if ( !query || !req || !res ) {
      console.log("ERROR: Pagination requires the unexecuted resource query + req and res objects from the route.\n\n");
    }

    // set the maximum number of items on each page
    perPage = perPage || process.env.PAGINATION_PER_PAGE || 10;
    // send the per page count as a http response header
    res.set("X-Pagination-Per-Page", perPage);

    // Set the current page integer
    currentPage = Number(req.query.page) || 1;
    res.set("X-Pagination-Page", currentPage);

    // Work out which resources to retrieve
    if ( currentPage === 1 ) {
      fromIndex = 0;
      toIndex = perPage + 1; // yes, it gets one extra (see below)
    } else {
      fromIndex = ( currentPage - 1 ) * perPage;
      toIndex = ( currentPage * perPage ) + 1; // yes, it gets one extra (see below)
    }

    // 2. APPLY FILTERS:
    if ( req.query.limit ) { query = applyLimit(query, req); }
    if ( req.query.from || req.query.to ) { query = applyStandardRange(query, req); }
    if ( req.query.fromDate || req.query.toDate ) { query = applyDateRange(query, req); }
    if ( req.query.search && req.query.searchField ) { query = applySearch(query, req); }

    // 3. PAGINATE ITEMS:
    query.slice(fromIndex, toIndex)
    .execute().then((resource) => {
      queryString = req.query;
      currentUrl = generalUtils.currentUrl(req);

      // Is there a previous page?
      if ( currentPage !== 1 ) {
        queryString["page"] = currentPage - 1;
        res.set("X-Pagination-Prev", currentUrl + "?" + qs.stringify(queryString));
      }

      // Can there be a next page?
      if ( resource[toIndex - 1] ) {
        queryString["page"] = currentPage + 1;
        res.set("X-Pagination-Next", currentUrl + "?" + qs.stringify(queryString));
        // Remove extra resource from the end of the array
        resource.splice(toIndex - 1, 1);
      }

      // Merge object if `mergeWith` was specified at the route level
      if ( mergeWith ) {
        addVars = generalUtils.addVars;
        if ( nested ) {
          mergeWith[nested] = resource;
          resource = mergeWith;
        } else {
          resource.forEach((each) => {
            Object.keys(mergeWith).forEach((key) => {
              each[addVars(key, each)] = addVars(mergeWith[key], each);
            });
          });
        }
      }

      // Count exact number of pages in the pagination
      query.count().execute().then((i) => {
        totalPages = Math.ceil( i / perPage );
        res.set("X-Pagination-Pages", totalPages);

        // Output the appropriate resources
        res.json(resource);
      }).error(handleError(res));
    }).error(handleError(res));
  }
}

// Filters
// limits the number of resources returned
function applyLimit(query, req) {
  limit = Number(req.query.limit) || undefined;
  if ( limit && limit > -1) {
    return query.limit(limit);
  } else {
    return query;
  }
}

// returns only a desired range of results. if no index field is specified,
// it will range using the to and from numbers as index values instead.
function applyStandardRange(query, req) {
  fromVal = req.query.from;
  toVal = req.query.to;
  indexField = req.query.index;

  // Parse strings to numbers if they are indeed numbers,
  // otherwise leave them as strings to apply the range with (rethink does this)
  if ( Number(fromVal) ) { fromVal = Number(fromVal); }
  if ( Number(toVal) ) { toVal = Number(toVal); }

  if ( indexField ) {
    if ( fromVal && toVal ) {
      return query.between(fromVal, toVal, {index: indexField, leftBound: "open", rightBound: "open"});
    } else if ( fromVal ) {
      return query.between(fromVal, r.maxval, {index: indexField, leftBound: "open", rightBound: "open"});
    } else if ( toVal ) {
      return query.between(r.minval, toVal, {index: indexField, leftBound: "open", rightBound: "open"});
    } else {
      // Do nothing
      return query;
    }
  } else {
    // No field given, so instead apply ranges by the records index position
    if ( Number(fromVal) && Number(fromVal) > -1 && Number(toVal) && Number(toVal) > -1 ) {
      return query.slice(Number(fromVal) - 1, Number(toVal));
    } else if ( Number(fromVal) && Number(fromVal) > -1 ) {
      return query.skip(Number(fromVal) - 1);
    } else if ( Number(toVal) && Number(toVal) > -1 ) {
      return query.limit(Number(toVal)); // same thing as the limit option
    } else {
      // Do nothing
      return query;
    }
  }
}

// returns results from a specific date range
function applyDateRange(query, req) {
  fromDate = req.query.fromDate;
  toDate = req.query.toDate;
  dateIndex = req.query.dateIndex || "createdAt";

  if ( Number(fromDate) && Number(toDate) ) {
    return query.filter(
      r.row(dateIndex).during(r.epochTime(Number(fromDate)), r.epochTime(Number(toDate)), {leftBound: "open", rightBound: "open"})
    );
  } else if ( Number(fromDate) ) {
    return query.filter(
      r.row(dateIndex).during(r.minval, r.epochTime(Number(toDate)), {leftBound: "open", rightBound: "open"})
    );
  } else if ( Number(toDate) ) {
    return query.filter(
      r.row(dateIndex).during(r.epochTime(Number(fromDate)), r.maxval, {leftBound: "open", rightBound: "open"})
    );
  } else {
    // Do nothing
    return query;
  }

  return query;
}

// search records using ?search=
function applySearch(query, req) {
  search = req.query.search;
  searchField = req.query.searchField;

  return query.filter((resource) => {
    return resource(searchField).match("(?i)" + search); // case insensitive
  });
}
