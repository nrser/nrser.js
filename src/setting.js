import { _ } from 'meteor/underscore';

import { UtilError } from './errors';

export class SettingError extends UtilError {}

export function setting(key, default_) {
  try {
    // if Meteor.settings is missing, nothing more to do
    if (!_.isObject(Meteor.settings)) {
      throw new SettingError(`
        Meteor.settings is NOT an object. this seems to happen when
        --settings <filename> is not passed on the command line.
      `);
    }

    // now see if we're on the client or the server to see which object
    // we can retrieve from
    if (Meteor.isClient) {
      // we're on the client, so can only retrieve from `public`
      if (!_.isObject(Meteor.settings.public)) {
        throw new SettingError(`
          Meteor.settings.public should be an object,
          not ${ typeof Meteor.settings.public }
        `);
      }

      if (!_.has(Meteor.settings.public, key)) {
        throw new SettingError(`
          Meteor.settings.public does not have key '${ key }'.

          Meteor.settings:

          ${ JSON.stringify(Meteor.settings, null, 2) }
        `);
      }
      
      return Meteor.settings.public[key];

    } else {
      // we're on the server
      
      //  if the key is in the server settings, use that
      if (_.has(Meteor.settings, key)) {
        return Meteor.settings[key];

      // if it's in the public settings, use that
      } else if (
        _.isObject(Meteor.settings.public) &&
        _.has(Meteor.settings.public, key)
      ) {
        return Meteor.settings.public[key];

      // it's nowhere :(
      } else {
        throw new SettingError(`
          neither Meteor.settings or Meteor.settings.public has key '${ key }'.

          Meteor.settings:

          ${ JSON.stringify(Meteor.settings, null, 2) }
        `);
      }
    }
  } catch (error) {
    if (_.isUndefined(default_)) {
      throw error;
    }
  }
}; // setting()
