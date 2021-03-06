// @flow

// Imports
// ==========================================================================

import chai, { expect } from 'chai';
import _ from '//src/nodash';
import t from 'tcomb';
import type { $Refinement } from 'tcomb';

import * as nrser from '//src/';


// Types
// ==========================================================================

declare function it(title: string, block: () => void): void;

function isErrorClass(obj: *): boolean {
  return obj === Error || obj.prototype instanceof Error;
}

type ErrorClass = any & $Refinement<typeof isErrorClass>;

function hasEvenLength(array: Array<*>): boolean {
  return array.length % 2 === 0;
}

type Pairable<V> = Array<V> & $Refinement<typeof hasEvenLength>;


// Private
// ==========================================================================

class Throws {
  errorClass: ErrorClass;
  pattern: ?RegExp;
  
  constructor(errorClass: ErrorClass = Error, pattern?: RegExp) {
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


// Exports
// ==========================================================================

// export * from './Describer';

/**
* OO structure for expectations.
*/
export class Expect<T> {
  instanceOf: T;
  props: Object;
  size: number;
  lengthOf: number;
  
  constructor({
    instanceOf,
    props,
    size,
    lengthOf,
    // members,
  }: {
    instanceOf: T,
    props: Object,
    size: number,
    lengthOf: number,
  }) {
    this.instanceOf = instanceOf;
    this.props = props;
    this.size = size;
    this.lengthOf = lengthOf;
    // this.members = members;
  }
  
  test(actual: *): void {
    if (this.instanceOf) {
      expect(actual).to.be.instanceOf(this.instanceOf);
    }
    
    if (this.props) {
      _.each(this.props, (value, name) => {
        expect(actual).to.have.property(name);
        
        if (value instanceof Expect) {
          value.test(actual[name]);
        } else {
          expect(actual[name]).to.eql(value);
        }
      });
    }
    
    if (this.size) {
      expect(_.size(actual)).to.equal(this.size);
    }
    
    if (this.lengthOf) {
      expect(actual).to.have.lengthOf(this.lengthOf);
    }
      
    // TODO figure this out...
    // if (this.members) {
    //   _.each(this.members, (value) => {
    //     if (value instanceof Expect) {
    //       expect(actual).to.have.any.member.that.satisfy()
    //     }
    //   });
    // }
  }
}

export function itMaps({
  func,
  map,
  
  funcName = func.name ? func.name.replace('bound ', '') : 'f',
  
  testMethod = 'eql',
  
  tester = ({actual, expected, testMethod}) => {
    if (expected instanceof Expect) {
      expected.test(actual);
    } else {
      expect(actual).to[testMethod](expected);
    }
  },
  
  formatArgs = (args: Array<*>, funcName: string): string => (
    `${ funcName }(${ _.map(args, (a) => JSON.stringify(a)).join(", ") })`
  ),
  
  formatExpected = (expected: *): string => {
    const json = JSON.stringify(expected);
    if (typeof json === 'string') {
      return json;
    }
    return '???';
  },
  
  formatter = (args: Array<*>, expected: *, funcName: string): string => {
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
        tester({actual: func(...args), expected, testMethod});
      }
    })
  }
}
