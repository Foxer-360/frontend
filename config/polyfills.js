"use strict";

import "core-js/es6/array";
import "core-js/es6/date";
import "core-js/es6/function";
import "core-js/es6/map";
import "core-js/es6/math";
import "core-js/es6/number";
import "core-js/es6/object";
import "core-js/es6/parse-float";
import "core-js/es6/parse-int";
import "core-js/es6/regexp";
import "core-js/es6/set";
import "core-js/es6/string";
import "core-js/es6/symbol";
import "core-js/es6/weak-map";
import "core-js/es7/array";
import "core-js/es7/object";
import "url-search-params-polyfill";

if (typeof Promise === "undefined") {
  // Rejection tracking prevents a common issue where React gets into an
  // inconsistent state due to an error, but it gets swallowed by a Promise,
  // and the user has no idea what causes React's erratic future behavior.
  require("promise/lib/rejection-tracking").enable();
  window.Promise = require("promise/lib/es6-extensions.js");
}

if (!String.prototype.startsWith) {
  Object.defineProperty(String.prototype, "startsWith", {
    value: function(search, pos) {
      pos = !pos || pos < 0 ? 0 : +pos;
      return this.substring(pos, pos + search.length) === search;
    }
  });
}

// fetch() polyfill for making API calls.
require("whatwg-fetch");

// Object.assign() is commonly used with React.
// It will use the native implementation if it's present and isn't buggy.
Object.assign = require("object-assign");

// In tests, polyfill requestAnimationFrame since jsdom doesn't provide it yet.
// We don't polyfill it in the browser--this is user's responsibility.
if (process.env.NODE_ENV === "test") {
  require("raf").polyfill(global);
}
