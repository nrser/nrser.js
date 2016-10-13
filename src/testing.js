// @flow

import chai from 'chai';
import _ from 'lodash';
import t from 'tcomb';
import type { $Refinement } from 'tcomb';

import * as nrser from '.';

declare function it(title: string, block: () => void): void;

function isErrorClass(obj: *): boolean {
  return obj.prototype instanceof Error;
}

type ErrorClass = any & $Refinement<typeof isErrorClass>;

function hasEvenLength(array: Array<*>): boolean {
  return array.length % 2 === 0;
}

type Pairable<V> = Array<V> & $Refinement<typeof hasEvenLength>;

class Throws {
  errorClass: ErrorClass;
  pattern: ?RegExp;
  
  constructor(errorClass: ErrorClass, pattern?: RegExp) {
    this.errorClass = errorClass;
    this.pattern = pattern;
  }
  
  throwArgs() {
    const args = [this.errorClass];
    if (this.pattern) {
      args.push(this.pattern);
    }
    return args;
  }
}

export function itMaps({
  func,
  map,
  
  funcName = func.name ? func.name.replace('bound ', '') : 'f',
  
  tester = ({actual, expected}) => {
    chai.expect(actual).to.eql(expected);
  },
  
  formatArgs = (args: Array<*>, funcName: string) /*: string */ => (
    `${ funcName }(${ _.map(args, (a) => JSON.stringify(a)).join(", ") })`
  ),
  
  formatExpected = (expected: *) /*: string */ => {
    const json = JSON.stringify(expected);
    if (typeof json === 'string') {
      return json;
    }
    return '???';
  },
  
  formatter = (args: Array<*>, expected: *, funcName: string) /*: string */ => {
    if (expected instanceof Throws) {
      return nrser.squish`
        ${ formatArgs(args, funcName) }
        throws
        ${ expected.errorClass.name }
      `;
      
    } else {
      return nrser.squish`
        maps
        ${ formatArgs(args, funcName) }
        to ${ formatExpected(expected) }
      `;
      
    }
  },
}: {
  func: Function,
  
  funcName?: string,
  
  // the map is function that accepts two arguments:
  map: (
    // 1. a wrapper that converts it's arguments to an array to be fed into
    // the test function
    f: (...args: Array<*>) => Array<*>,
    // 2. a function that creates a {Throws} to indicate the call should
    // throw an error of a certain type with an optional pattern for the
    // message
    throws: (errorClass: ErrorClass, pattern?: RegExp) => Throws,
  // and returns a array of even length that represents actual, expected pairs
  ) => Pairable<*>,
  
  // the function the performs the assertions, the default implementation of
  // which checks that the actual is deeply equal to the expected.
  tester?: (pair: {actual: *, expected: *}) => void,
  
  // a function to format the calling args for display
  formatArgs?: (args: Array<*>, funcName: string) => string,
  
  // a function to format the expected value
  formatExpected?: (expected: *) => string,
  
  // a function to format it all that calls the others by default
  formatter?: (args: Array<*>, expected: *, funcName: string) => string,
}): void {
  const mapping: Pairable<*> = map(
    (...args) => args,
    (errorClass, pattern) => new Throws(errorClass, pattern)
  );
  
  for (let i = 0; i < mapping.length; i += 2) {
    const args = mapping[i];
    const expected = mapping[i + 1];
    
    it(formatter(args, expected, funcName), () => {
      if (expected instanceof Throws) {
        chai.expect(
          () => func(...args)
        ).to.throw(expected.errorClass, expected.pattern);
      } else {
        tester({actual: func(...args), expected});
      }
    })
  }
}
