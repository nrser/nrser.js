export var Meteor;

try {
  Meteor = require('meteor/meteor').Meteor;
  console.log("meteor!");
} catch (e) {
  console.log("no meteor!");
  throw e;
}
