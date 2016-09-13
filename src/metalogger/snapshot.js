function canReferenceInSnaphot(value) {
  return (
    _.isBoolean(value) ||
    _.isNull(value) ||
    _.isUndefined(value) ||
    _.isNumber(value) ||
    _.isString(value) ||
    _.isFunction(value) ||
    _.isNaN(value) ||
    (typeof value === 'symbol')
  )
} // canReferenceInSnaphot()

function cloneRegExp(input) {
  var pattern = input.source;
  var flags = "";
  
  // Test for global.
  if (input.global) {
    flags += "g";
  }
  // Test for ignoreCase.
  if (input.ignoreCase) {
    flags += "i";
  }
  // Test for multiline.
  if (input.multiline) {
    flags += "m";
  }
  // Return a clone with the additive flags.
  return new RegExp(pattern, flags);
} // cloneRegExp()

function snapshot(value) {
  const clone = _.cloneDeep(value);
  
  return clone;
}

// function snapshot(value, seen = new Set()) {
//   if (Logger.canReferenceInSnaphot(value)) {
//     return value;
//     
//   } else if (_.isDate(value)) {
//     return new Date(value);
//     
//   } else if (_.isArray(value)) {
//     if (seen.has(value)) {
//       return value;
//     } else {
//       seen.add(value);
//       return _.map(value, function(i){ return Logger.snapshot(i, seen) });
//     }
//     
//   } else if (_.isRegExp(value)) {
//     return Logger.cloneRegExp(value);
//   
//   // } else if (_.isError(value)) {
//   //   // TODO prob not right but how often to we mutate errors?
//   //   return value;
//     
//   } else if (_.isObject(value)) {
//     if (seen.has(value)) {
//       return seen[value;
//     } else {
//       seen.add(value);
//       const copy = {};
//       // _.each(value, function(v, k) { copy[k] = Logger.snapshot(v, seen) });
//       for (let k in value) {
//         copy[k] = Logger.snapshot(value[k], seen);
//       }
//       return copy;
//     }
//     
//   } else {
//     console.log("snapshot() is not sure what this is", value);
//     
//     return `UNKNOWN: ${ value.toString() }`;
//   }
// } // snapshot()